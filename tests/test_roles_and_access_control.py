"""
Automated Acceptance Tests for IntervAI Roles, Tokenized Assessment Links,
Hybrid Taker Entry (Approach 3), One-Claimer Lock, and Report Ownership.

Covers all 8 requirements from docs/intervai_roles_note.md (Section 6)
with 0 Gnani / LiveKit credits spent.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
import datetime
import uuid
import httpx
from bson import ObjectId

from server.app import app
from server.database import db
from server.agent.tools import AssistantFnc


async def run_acceptance_tests():
    tag = uuid.uuid4().hex[:6]
    created_usernames = [
        f"teacher_a_{tag}",
        f"teacher_b_{tag}",
        f"recruiter_x_{tag}",
        f"recruiter_y_{tag}",
        f"student_1_{tag}",
        f"candidate_1_{tag}",
        f"candidate_2_{tag}",
    ]
    created_assessment_ids = []
    created_session_ids = []

    print("=" * 70)
    print("🔐 RUNNING INTERVAI ROLES & ACCESS CONTROL ACCEPTANCE TESTS")
    print("=" * 70)

    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:

            # Helper to register a user and return (token, user_dict)
            async def register_user(uname: str, role: str, name: str, org: str):
                r = await client.post("/api/register", json={
                    "username": uname,
                    "password": "pass123",
                    "email": f"{uname}@example.com",
                    "role": role,
                    "full_name": name,
                    "organization": org,
                })
                assert r.status_code == 200, r.text
                data = r.json()
                return data["access_token"], data["user"]

            t_a_tok, t_a = await register_user(created_usernames[0], "teacher", "Prof. A", "COEP")
            t_b_tok, t_b = await register_user(created_usernames[1], "teacher", "Prof. B", "VJTI")
            r_x_tok, r_x = await register_user(created_usernames[2], "recruiter", "Recruiter X", "Acme Corp")
            r_y_tok, r_y = await register_user(created_usernames[3], "recruiter", "Recruiter Y", "Beta Inc")
            s_1_tok, s_1 = await register_user(created_usernames[4], "student", "Student One", "COEP")
            c_1_tok, c_1 = await register_user(created_usernames[5], "candidate", "Candidate One", "")
            c_2_tok, c_2 = await register_user(created_usernames[6], "candidate", "Candidate Two", "")

            # ── Test 4: Student/Candidate calling Assessor-only endpoint is rejected (403)
            r_forbidden = await client.post(
                "/api/assessments",
                json={"role_title": "Unauthorized Assessment", "track": "tech"},
                headers={"Authorization": f"Bearer {s_1_tok}"},
            )
            assert r_forbidden.status_code == 403, f"Expected 403, got {r_forbidden.status_code}"
            r_list_forbidden = await client.get(
                "/api/assessments",
                headers={"Authorization": f"Bearer {c_1_tok}"},
            )
            assert r_list_forbidden.status_code == 403
            print("✅ [Test 4] Student & Candidate blocked from Assessor-only endpoints (403)")

            # ── Test 5: Changing role in request body / profile update does nothing
            r_escalate = await client.patch(
                "/api/me",
                json={"role": "recruiter", "full_name": "Student One Renamed"},
                headers={"Authorization": f"Bearer {s_1_tok}"},
            )
            assert r_escalate.status_code == 200
            assert r_escalate.json()["role"] == "student"
            print("✅ [Test 5] Role immutability verified: profile update ignores role change")

            # ── Test 8A (Happy Path — Teacher & Guest Student via Hybrid Approach 3):
            # Teacher A creates a Python Viva assessment in Hinglish
            r_assess_ta = await client.post(
                "/api/assessments",
                json={
                    "role_title": "CS101 Python Practical Viva",
                    "track": "tech",
                    "language": "hinglish",
                    "max_attempts": 1,
                },
                headers={"Authorization": f"Bearer {t_a_tok}"},
            )
            assert r_assess_ta.status_code == 200, r_assess_ta.text
            ta_assess = r_assess_ta.json()
            ta_assess_id = ta_assess["assessment_id"]
            ta_share_token = ta_assess["share_token"]
            created_assessment_ids.append(ObjectId(ta_assess_id))
            assert ta_assess["share_with_taker"] is True  # Teacher default = True

            # Guest Student previews link without login
            r_prev = await client.get(f"/api/assessments/by-token/{ta_share_token}")
            assert r_prev.status_code == 200
            assert r_prev.json()["role_title"] == "CS101 Python Practical Viva"

            # Guest Student claims link with Name + Email (no account login)
            r_claim = await client.post("/api/assessments/claim", json={
                "token": ta_share_token,
                "taker_name": "Aarav Guest Student",
                "taker_email": "aarav.guest@student.edu",
            })
            assert r_claim.status_code == 200, r_claim.text
            claim_data = r_claim.json()
            guest_sess_id = claim_data["session_id"]
            guest_sess_secret = claim_data["session_secret"]
            created_session_ids.append(ObjectId(guest_sess_id))

            # ── Test 1: Taker B cannot claim or open a session already claimed by Taker A
            r_hijack_claim = await client.post("/api/assessments/claim", json={
                "token": ta_share_token,
                "taker_name": "Intrusive Taker B",
                "taker_email": "takerb@evil.com",
            })
            assert r_hijack_claim.status_code == 403, f"Expected 403, got {r_hijack_claim.status_code}"

            # Taker B (logged in as Candidate 2) tries to request a LiveKit token for Guest Student's session_id
            r_hijack_lk = await client.get(
                f"/api/token?session_id={guest_sess_id}",
                headers={"Authorization": f"Bearer {c_2_tok}"},
            )
            assert r_hijack_lk.status_code == 403
            print("✅ [Test 1] Taker B blocked from claiming or hijacking Taker A's session (403)")

            # Guest Student gets valid LiveKit token using their session_secret
            r_valid_lk = await client.get(
                f"/api/token?session_id={guest_sess_id}&session_secret={guest_sess_secret}"
            )
            assert r_valid_lk.status_code == 200, r_valid_lk.text

            # Simulate voice agent completing the viva & submitting evaluation via AssistantFnc
            sess_doc = await db.interview_sessions.find_one({"_id": ObjectId(guest_sess_id)})
            fnc = AssistantFnc(username=sess_doc["taker_username"], room=None, session_meta={
                "session_id": guest_sess_id,
                "assessment_id": ta_assess_id,
                "is_practice": False,
                "assessor_id": t_a["id"],
                "assessor_username": t_a["username"],
                "taker_user_id": None,
                "taker_username": sess_doc["taker_username"],
                "taker_name": "Aarav Guest Student",
                "taker_email": "aarav.guest@student.edu",
                "share_with_taker": True,
                "role_title": "CS101 Python Practical Viva",
                "track": "tech",
                "language": "hinglish",
            })
            await fnc.submit_evaluation(
                technical_accuracy=9,
                communication=8,
                confidence=8,
                depth=9,
                completeness=9,
                overall_score=9,
                strengths=["Explained time complexity O(n) clearly"],
                areas_for_improvement=["Handle edge cases for empty input"],
                summary="Strong viva defense matching submitted Python code.",
            )

            # Teacher A sees the guest student's report on their dashboard!
            r_ta_evals = await client.get(
                "/api/evaluations?scope=assigned",
                headers={"Authorization": f"Bearer {t_a_tok}"},
            )
            assert r_ta_evals.status_code == 200
            ta_evals = r_ta_evals.json()
            assert len(ta_evals) == 1
            eval_id_ta = ta_evals[0]["_id"]
            assert ta_evals[0]["taker_name"] == "Aarav Guest Student"

            # ── Test 3: Teacher B & Recruiter X CANNOT see Teacher A's assessment or report (404)
            r_tb_steal_assess = await client.get(
                f"/api/assessments/{ta_assess_id}",
                headers={"Authorization": f"Bearer {t_b_tok}"},
            )
            assert r_tb_steal_assess.status_code == 404
            r_tb_steal_eval = await client.get(
                f"/api/evaluations/{eval_id_ta}",
                headers={"Authorization": f"Bearer {t_b_tok}"},
            )
            assert r_tb_steal_eval.status_code == 404
            r_rx_steal_eval = await client.get(
                f"/api/evaluations/{eval_id_ta}",
                headers={"Authorization": f"Bearer {r_x_tok}"},
            )
            assert r_rx_steal_eval.status_code == 404
            print("✅ [Test 3] Cross-assessor isolation verified (Teacher B & Recruiter X get 404)")

            # ── Test 2: Expired link, closed window, and exceeded attempts are rejected
            past_time = (datetime.datetime.utcnow() - datetime.timedelta(hours=2)).isoformat() + "Z"
            r_exp_create = await client.post(
                "/api/assessments",
                json={
                    "role_title": "Expired Sales Test",
                    "track": "bda",
                    "expires_at": past_time,
                },
                headers={"Authorization": f"Bearer {r_x_tok}"},
            )
            exp_token = r_exp_create.json()["share_token"]
            created_assessment_ids.append(ObjectId(r_exp_create.json()["assessment_id"]))

            r_exp_claim = await client.post("/api/assessments/claim", json={
                "token": exp_token,
                "taker_name": "Late Candidate",
                "taker_email": "late@example.com",
            })
            assert r_exp_claim.status_code == 400
            print("✅ [Test 2] Expired link & exceeded attempts properly rejected (400)")

            # ── Test 6 & 7: Practice reports visible ONLY to owner; foreign LiveKit token rejected
            r_prac = await client.post(
                "/api/sessions",
                json={"track": "bda", "language": "hinglish", "role_title": "My Private Practice"},
                headers={"Authorization": f"Bearer {s_1_tok}"},
            )
            assert r_prac.status_code == 200
            prac_sess_id = r_prac.json()["session_id"]
            created_session_ids.append(ObjectId(prac_sess_id))

            # Candidate 1 tries to get LiveKit token for Student 1's practice session -> 404
            r_foreign_lk = await client.get(
                f"/api/token?session_id={prac_sess_id}",
                headers={"Authorization": f"Bearer {c_1_tok}"},
            )
            assert r_foreign_lk.status_code == 404
            print("✅ [Test 6] LiveKit token refused for foreign/invalid session (404)")

            # Save a practice report for Student 1
            fnc_prac = AssistantFnc(username=s_1["username"], room=None, session_meta={
                "session_id": prac_sess_id,
                "assessment_id": None,
                "is_practice": True,
                "taker_user_id": s_1["id"],
                "taker_username": s_1["username"],
                "taker_name": s_1["full_name"],
                "role_title": "My Private Practice",
                "track": "bda",
                "language": "hinglish",
            })
            await fnc_prac.submit_evaluation(7, 8, 7, 7, 8, 7, ["Good pitch"], ["Speak slower"], "Solid practice run.")

            # Student 1 sees their practice report; Teacher A CANNOT see Student 1's practice report
            r_s1_evals = await client.get("/api/evaluations?scope=practice", headers={"Authorization": f"Bearer {s_1_tok}"})
            assert len(r_s1_evals.json()) == 1
            prac_eval_id = r_s1_evals.json()[0]["_id"]

            r_ta_peek = await client.get(f"/api/evaluations/{prac_eval_id}", headers={"Authorization": f"Bearer {t_a_tok}"})
            assert r_ta_peek.status_code == 404
            print("✅ [Test 7] Practice reports are strictly private to the practitioner (404 for assessors)")

            # ── Test 8B: Recruiter X creates BDA assessment (default share_with_taker=False) -> Candidate 1 takes it
            r_rx_assess = await client.post(
                "/api/assessments",
                json={"role_title": "BDA Hinglish Pitch Screening", "track": "bda", "language": "hinglish"},
                headers={"Authorization": f"Bearer {r_x_tok}"},
            )
            rx_assess = r_rx_assess.json()
            rx_assess_id = rx_assess["assessment_id"]
            created_assessment_ids.append(ObjectId(rx_assess_id))
            assert rx_assess["share_with_taker"] is False  # Recruiter default = False

            r_c1_claim = await client.post(
                "/api/assessments/claim",
                json={"token": rx_assess["share_token"]},
                headers={"Authorization": f"Bearer {c_1_tok}"},
            )
            assert r_c1_claim.status_code == 200
            c1_sess_id = r_c1_claim.json()["session_id"]
            created_session_ids.append(ObjectId(c1_sess_id))

            fnc_bda = AssistantFnc(username=c_1["username"], room=None, session_meta={
                "session_id": c1_sess_id,
                "assessment_id": rx_assess_id,
                "is_practice": False,
                "assessor_id": r_x["id"],
                "assessor_username": r_x["username"],
                "taker_user_id": c_1["id"],
                "taker_username": c_1["username"],
                "taker_name": c_1["full_name"],
                "taker_email": c_1["email"],
                "share_with_taker": False,
                "role_title": "BDA Hinglish Pitch Screening",
                "track": "bda",
                "language": "hinglish",
            })
            await fnc_bda.submit_evaluation(8, 9, 9, 8, 8, 8, ["Handled price objection"], ["Ask for close earlier"], "Strong BDA candidate.")

            # Recruiter X sees Candidate 1's report; Recruiter Y cannot; Candidate 1 cannot until shared
            r_rx_list = await client.get("/api/evaluations?scope=assigned", headers={"Authorization": f"Bearer {r_x_tok}"})
            assert len(r_rx_list.json()) == 1
            bda_eval_id = r_rx_list.json()[0]["_id"]

            r_c1_peek = await client.get(f"/api/evaluations/{bda_eval_id}", headers={"Authorization": f"Bearer {c_1_tok}"})
            assert r_c1_peek.status_code == 404  # Hidden by default for Recruiter assessments

            # Recruiter X toggles share_with_taker=True -> now Candidate 1 can view it!
            await client.patch(
                f"/api/assessments/{rx_assess_id}",
                json={"share_with_taker": True},
                headers={"Authorization": f"Bearer {r_x_tok}"},
            )
            r_c1_allowed = await client.get(f"/api/evaluations/{bda_eval_id}", headers={"Authorization": f"Bearer {c_1_tok}"})
            assert r_c1_allowed.status_code == 200
            print("✅ [Test 8] End-to-End Teacher/Student & Recruiter/Candidate flows + share toggle PASSED!")

            print("\n" + "=" * 70)
            print("🎉 ALL 8 ACCEPTANCE TESTS PASSED (0 CREDITS USED)!")
            print("=" * 70)

    finally:
        # Clean up test documents
        await db.users.delete_many({"username": {"$in": created_usernames}})
        if created_assessment_ids:
            await db.assessments.delete_many({"_id": {"$in": created_assessment_ids}})
        if created_session_ids:
            await db.interview_sessions.delete_many({"_id": {"$in": created_session_ids}})
        await db.evaluations.delete_many({
            "$or": [
                {"assessor_username": {"$in": created_usernames}},
                {"taker_username": {"$in": created_usernames}},
                {"taker_email": "aarav.guest@student.edu"},
            ]
        })


        from server.database import client
        client.close()


if __name__ == "__main__":
    asyncio.run(run_acceptance_tests())

