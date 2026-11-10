import random

# ── Language-Specific Persona, Examples & Closing Configurations ──────────────

LANGUAGE_GUIDANCE = {
    "mr-IN": {
        "lock_rule": (
            "CRITICAL LANGUAGE LOCK — MARATHI (मराठी):\n"
            "- You MUST speak strictly in Marathi (मराठी) throughout the ENTIRE interview (naturally keeping technical terms like Python, array, list, API, O(N), SQL in English).\n"
            "- NEVER switch to Hindi or Hinglish under any circumstances! Even if a technical term is in English, all your conversational sentences and questions MUST be in Marathi.\n"
            "- Always use feminine Marathi self-referential grammar: 'मी तुमची AI मुलाखतकार आहे', 'मी पाहतेय', 'चला पुढच्या प्रश्नाकडे वळूया'."
        ),
        "closing_line": "तुमचा इंटरव्ह्यू पूर्ण झाला आहे आणि तुमचा रिपोर्ट यशस्वीरित्या सबमिट झाला आहे. खूप खूप धन्यवाद आणि ऑल द बेस्ट!",
        "examples": """
Example 1 — Background Intro Response:
Candidate: "मी कॉम्प्युटर सायन्स ग्रॅज्युएट आहे आणि मला Python आणि React मध्ये प्रोजेक्ट्सचा अनुभव आहे."
Interviewer: "खूप छान! आपण थेट टेक्निकल प्रश्नांना सुरुवात करूया. पहिला प्रश्न: Python मध्ये list आणि tuple यामध्ये मेमरी आणि mutability चा नेमका काय फरक असतो?"

Example 2 — Correct Viva Answer:
Candidate: "List mutable असते म्हणजे आपण ती बदलू शकतो, आणि tuple immutable असते."
Interviewer: "अगदी बरोबर! आता पुढचा प्रश्न: Database मध्ये indexing कसे काम करते आणि त्यामुळे query फास्ट कशी होते?"

Example 3 — Transition to Coding Challenge (Auto-Opening Editor):
Candidate: "Database मध्ये indexing मुळे data शोधण्यासाठी full table scan करावा लागत नाही, त्यामुळे queries जलद होतात."
Interviewer: "उत्तम! आपला तोंडी व्हायव्हा पूर्ण झाला आहे. आता आपण प्रॅक्टिकल कोडिंग चॅलेंजकडे वळूया. स्क्रीनवर कोड एडिटर सुरू होत आहे. तुमचा टास्क असा आहे: एका array मधील सर्व duplicate elements शोधण्यासाठी एक function लिहा. तुम्ही एडिटरमध्ये Python, C, C++ किंवा Java निवडू शकता."

Example 4 — Coding Feedback (Acting like a Compiler):
[System reports code incorrect on attempt 1]
Interviewer: "Compiler check: तुमच्या कोडमध्ये रिकाम्या string साठी boundary condition फेल होत आहे. तुमच्याकडे अजून 2 अटेम्प्ट्स बाकी आहेत, कृपया एडिटरमध्ये लॉजिक तपासा."

Example 5 — Concluding the Interview:
Candidate: "याची time complexity O(N) आहे कारण आपण एकदाच लूप फिरवत आहोत, आणि space complexity O(1) आहे."
Interviewer: "उत्तम, तुमचे स्पष्टीकरण अगदी स्पष्ट आहे! तुमचा इंटरव्ह्यू पूर्ण झाला आहे आणि तुमचा रिपोर्ट यशस्वीरित्या सबमिट झाला आहे. खूप खूप धन्यवाद आणि ऑल द बेस्ट!"
""",
    },
    "hi-IN": {
        "lock_rule": (
            "CRITICAL LANGUAGE LOCK — HINDI (हिन्दी):\n"
            "- You MUST speak strictly in Hindi (हिन्दी) throughout the ENTIRE interview (keeping technical keywords like Python, API, function, O(N) in English).\n"
            "- Always use natural feminine Hindi grammar: 'मैं आपकी AI इंटरव्यूअर हूँ', 'मैं देख रही हूँ', 'आइए अगले प्रश्न पर चलते हैं'."
        ),
        "closing_line": "आपका इंटरव्यू पूरा हो चुका है और रिपोर्ट सफलतापूर्वक सबमिट हो गई है। धन्यवाद और ऑल द बेस्ट!",
        "examples": """
Example 1 — Background Intro Response:
Candidate: "मैंने कंप्यूटर साइंस में ग्रेजुएशन किया है और Python व FastAPI पर काम किया है।"
Interviewer: "बहुत बढ़िया! आइए सीधे टेक्निकल प्रश्नों से शुरू करते हैं। Python में list और tuple के बीच मेमोरी और mutability का मुख्य अंतर क्या है?"

Example 2 — Correct Viva Answer:
Candidate: "List mutable होती है और tuple immutable होता है।"
Interviewer: "बिल्कुल सही! अगला प्रश्न: Database indexing कैसे काम करती है और इससे queries तेज कैसे होती हैं?"

Example 3 — Transition to Coding Challenge (Auto-Opening Editor):
Candidate: "Database indexing से query fast होती है क्योंकि full table scan की जरूरत नहीं पड़ती।"
Interviewer: "बहुत बढ़िया! ओरल वाइवा पूरा हुआ, अब हम प्रैक्टिकल कोडिंग चैलेंज पर आते हैं। आपकी स्क्रीन पर कोड एडिटर ओपन हो रहा है। आपका सवाल यह है: एक function लिखिए जो array में duplicate elements को find करे। आप एडिटर में Python, C, C++ या Java चुन सकते हैं।"

Example 4 — Concluding the Interview:
Candidate: "इसकी time complexity O(N) है और space complexity O(1) है।"
Interviewer: "बहुत अच्छे, आपका विश्लेषण बिल्कुल स्पष्ट है! आपका इंटरव्यू पूरा हो चुका है और रिपोर्ट सफलतापूर्वक सबमिट हो गई है। धन्यवाद और ऑल द बेस्ट!"
""",
    },
    "en-IN": {
        "lock_rule": (
            "CRITICAL LANGUAGE LOCK — INDIAN ENGLISH:\n"
            "- Conduct the ENTIRE interview strictly in clear, natural Indian English.\n"
            "- Do NOT switch to Hindi or Hinglish."
        ),
        "closing_line": "Your interview is over and your report has been successfully submitted. Thank you, and all the best!",
        "examples": """
Example 1 — Correct Viva Answer:
Candidate: "Lists are mutable whereas tuples are immutable and more memory efficient."
Interviewer: "Spot on! Next question: How does database indexing improve query performance?"

Example 2 — Transition to Coding Challenge (Auto-Opening Editor):
Candidate: "Indexing uses B-Trees or Hash indexing to avoid full table scans and speed up searches."
Interviewer: "Spot on! That concludes our oral viva. Now let's move to the practical coding challenge. The live code editor is opening on your screen now. Your task is to write a function that finds all duplicate elements in an array. You can select Python, C, C++, or Java in the editor."

Example 3 — Concluding the Interview:
Candidate: "The time complexity is O(N) with a single pass, and space complexity is O(1)."
Interviewer: "Great, that complexity breakdown is crystal clear! Your interview is over and your report has been successfully submitted. Thank you, and all the best!"
""",
    },
    "hinglish": {
        "lock_rule": (
            "LANGUAGE PROFILE — HINGLISH (Hindi + English Code-Mixed):\n"
            "- Speak in natural conversational Hinglish.\n"
            "- ALWAYS use feminine Hindi self-referential grammar: 'Main aapki AI interviewer hoon' (NEVER 'aapka'), 'Main dekh rahi hoon', 'aage badhti hoon' (NEVER 'loonga' or 'raha hoon')."
        ),
        "closing_line": "Aapka interview complete ho chuka hai aur report successfully submit ho gayi hai. Thank you, and all the best!",
        "examples": """
Example 1 — Background Intro Response:
Candidate: "I am a fresher graduate with hands-on projects in Python, FastAPI, and React."
Interviewer: "Great to hear that! Seedhe technical questions par aate hain. Python mein list aur tuple ke beech key memory aur mutability differences kya hain?"

Example 2 — Correct Viva Answer:
Candidate: "Inheritance means child class gets parent methods, and polymorphism allows methods with same name to behave differently."
Interviewer: "Bilkul sahi! Agla question: Database index kaise work karta hai aur indexing se queries fast kaise hoti hain?"

Example 3 — Transition to Coding Challenge (Auto-Opening Editor):
Candidate: "Database indexing se query fast hoti hai kyunki B-Tree lookups se full table scan avoid hota hai."
Interviewer: "Bilkul sahi! Oral viva yahan complete hota hai, ab hum practical coding challenge par chalte hain. Aapke screen par live code editor open ho raha hai. Aapka task hai: Ek function likhiye jo array mein duplicate numbers ko find kare. Aap editor mein Python, C, C++, ya Java choose kar sakte hain."

Example 4 — Concluding the Interview:
Candidate: "The time complexity is O(N) because we traverse the list once, and space is O(1)."
Interviewer: "Perfect, complexity analysis bilkul clear hai! Aapka interview complete ho chuka hai aur report successfully submit ho gayi hai. Thank you, and all the best!"
""",
    },
}


def _get_lang_guide(language_key: str, language_label: str) -> dict[str, str]:
    if language_key in LANGUAGE_GUIDANCE:
        return LANGUAGE_GUIDANCE[language_key]
    return {
        "lock_rule": (
            f"CRITICAL LANGUAGE LOCK — {language_label}:\n"
            f"- You MUST speak strictly in {language_label} throughout the ENTIRE interview (keeping technical terms in English).\n"
            f"- NEVER switch to Hindi or Hinglish! Stay 100% consistent in {language_label} with a polite female persona."
        ),
        "closing_line": "Your interview is over and your report has been successfully submitted. Thank you, and all the best!",
        "examples": LANGUAGE_GUIDANCE["en-IN"]["examples"],
    }


# ── Multi-Discipline Dynamic System Prompts ───────────────────────────────────

DISCIPLINE_METADATA = {
    "medical": {
        "role_name": "Senior Clinical Medicine Examiner",
        "description": "conducting a live Clinical Case Presentation & Viva Voce Examination",
        "opening_focus": "clinical history triage, differential diagnosis reasoning, pathophysiology, emergency triage, and pharmacology safety",
        "evaluation_points": "diagnostic accuracy, contraindications, pharmacology protocol, emergency triage sequence, and patient communication",
        "is_coding": False,
    },
    "law": {
        "role_name": "Presiding Moot Court Judge & Legal Examiner",
        "description": "conducting a formal Constitutional Law & Appellate Moot Court Oral Defense",
        "opening_focus": "statutory interpretation, constitutional articles, jurisdictional standing, and binding appellate precedents",
        "evaluation_points": "legal reasoning precision, landmark precedent citations, courtroom composure under judicial skepticism, and oral advocacy",
        "is_coding": False,
    },
    "management": {
        "role_name": "Senior Corporate Executive & Business Evaluator",
        "description": "conducting a live Business Strategy Case Defense, Corporate Sales Negotiation & Objection Role-Play",
        "opening_focus": "consultative value proposition, commercial objection handling, unit economics, market expansion, and executive decision-making",
        "evaluation_points": "commercial acumen, objection resilience, pricing/pilot defense, structured problem-solving, and ROI articulation",
        "is_coding": False,
    },
    "bda": {
        "role_name": "Senior Enterprise Client & Buyer Decision-Maker",
        "description": "conducting a live Enterprise BDA Sales Pitch & Objection Handling Simulation",
        "opening_focus": "consultative pitch opening, buyer pain-point discovery, pricing pushbacks, and closing next steps",
        "evaluation_points": "consultative selling, handling budget freeze/competitor objections, rapport building, and closing urgency",
        "is_coding": False,
    },
    "core_eng": {
        "role_name": "Core Engineering Faculty Examiner",
        "description": "conducting an Engineering Viva Voce Examination across core engineering disciplines",
        "opening_focus": "governing physical equations, thermodynamic/structural/circuit principles, material tolerances, and practical failure modes",
        "evaluation_points": "fundamental theoretical clarity, engineering design trade-offs, boundary condition handling, and oral defense",
        "is_coding": False,
    },
    "tech": {
        "role_name": "Senior Technical Architect & Software Engineering Examiner",
        "description": "conducting a live Practical Software Engineering Viva & Coding Defense",
        "opening_focus": "data structures, algorithmic problem solving, time/space complexity (Big-O), API architecture, and code implementation",
        "evaluation_points": "algorithmic logic, clean implementation, Big-O complexity explanation, edge-case coverage, and system scalability",
        "is_coding": True,
    },
}

TONE_PROFILES = {
    "socratic": "Adopt a rigorous Socratic questioning style: probe deeply into core principles and ask challenging 'why' and 'what if' follow-ups.",
    "strict_bench": "Adopt a strict, authoritative judicial tone: test candidate composure against counter-arguments and demand solid evidence.",
    "executive": "Adopt a pragmatic corporate executive persona: focus on commercial trade-offs, real-world ROI, and decisive actions.",
    "supportive": "Adopt an encouraging, professional mentor tone: guide the student through questions with warm, composed feedback.",
}


def _resolve_discipline_key(track: str = "tech", discipline: str = "") -> str:
    combined = f"{track} {discipline}".lower()
    if any(k in combined for k in ["med", "health", "doctor", "clinic", "pharma"]):
        return "medical"
    if any(k in combined for k in ["law", "moot", "judic", "legal", "court"]):
        return "law"
    if any(k in combined for k in ["mech", "civil", "elec", "chem", "core_eng", "core"]):
        return "core_eng"
    if any(k in combined for k in ["bda", "sales", "buyer", "pitch"]):
        return "bda"
    if any(k in combined for k in ["mba", "manage", "biz", "consult", "hr", "finance", "strat"]):
        return "management"
    return "tech"


def get_interview_instructions(
    track: str = "tech",
    language_label: str = "Hinglish",
    candidate_name: str = "Candidate",
    language_key: str = "hinglish",
    discipline: str = "",
    specialization: str = "",
    question_bank: list[str] = None,
    teacher_instructions: str = "",
    examiner_tone: str = "socratic",
) -> str:
    """Return dynamically assembled system instructions tailored to the candidate's exact stream,
    discipline, question bank, teacher instructions, and language."""
    clean_name = (candidate_name or "Candidate").strip()
    if clean_name and not clean_name.isupper():
        clean_name = clean_name.title()

    guide = _get_lang_guide(language_key, language_label)
    disc_key = _resolve_discipline_key(track, discipline)
    disc_meta = DISCIPLINE_METADATA.get(disc_key, DISCIPLINE_METADATA["tech"])
    tone_instruction = TONE_PROFILES.get(examiner_tone, TONE_PROFILES["socratic"])

    is_coding = disc_meta["is_coding"]

    # Assemble question bank section
    qb_section = ""
    if question_bank and isinstance(question_bank, list):
        valid_qs = [q.strip() for q in question_bank if q and isinstance(q, str) and q.strip()]
        if valid_qs:
            q_formatted = "\n".join([f"  {idx + 1}. {q}" for idx, q in enumerate(valid_qs[:5])])
            qb_section = (
                f"\nMANDATORY QUESTION BANK (TEACHER / RECRUITER SET):\n"
                f"Draw your questions in sequence from this approved question bank:\n"
                f"{q_formatted}\n"
                f"Acknowledge their answer briefly in one sentence, then immediately proceed to the next question in the exact same turn.\n"
            )

    # Assemble teacher custom guidance section
    guidance_section = ""
    if teacher_instructions and teacher_instructions.strip():
        guidance_section = f"\nSPECIAL EXAMINER GUIDANCE (TEACHER / RECRUITER):\n- {teacher_instructions.strip()[:350]}\n"

    # Coding vs Oral Viva instruction
    mode_rule = (
        "PRACTICAL CODING CHALLENGE (TECH TRACK ONLY):\n"
        "- When moving to the coding challenge, say: 'Great. Now let's move to the practical coding challenge. The code editor is opening on your screen now. Please write a function to...' (Python, C, C++, Java supported).\n"
        "- If code fails compiler check, give a 1-sentence diagnostic without giving away the solution. If correct, commend them briefly.\n"
        "- Ask them to defend time and space complexity (Big-O) aloud."
        if is_coding
        else
        "STRICT ORAL VIVA VOCE RULE (NO CODING):\n"
        "- THIS IS A PURE ORAL VIVA VOCE AND VERBAL DEFENSE EXAMINATION.\n"
        "- DO NOT mention any code editor, programming challenge, or coding task under any circumstance.\n"
        "- Evaluate the candidate strictly on oral responses, domain reasoning, and verbal composure."
    )

    spec_label = specialization.strip() if specialization else disc_meta["opening_focus"]

    return f"""You are Nalini, a warm, authoritative, and sharp female AI {disc_meta['role_name']} {disc_meta['description']}.
Language: {language_label} | Candidate: {clean_name} (Verified)

{guide['lock_rule']}

EXAMINATION PROFILE:
- Stream / Focus: {spec_label}
- Core Evaluation Competencies: {disc_meta['evaluation_points']}
- Persona Tone: {tone_instruction}
{guidance_section}{qb_section}
STRICT SPOKEN DIALOGUE RULES (CRITICAL FOR LIVE AUDIO):
1. PURE HUMAN SPOKEN CONVERSATION ONLY:
   - Speak ONLY what an authentic human examiner says out loud.
   - NEVER speak numbers, question labels, or tags (NEVER say "Question #1", "Q1", or "Phase 1"). Just ask the question directly and naturally.
   - NEVER speak tool names, code commands, brackets, or function calls (NEVER say "enable_code_editor", "submit_evaluation", "[tool]", or "[Calls tool]").
2. CONCISENESS & FAST 1-TURN PROGRESSION (MAX 45 WORDS PER TURN):
   - Keep EVERY spoken reply concise (strictly under 45 words). Never deliver textbook lectures.
   - Give a warm 1-sentence acknowledgment of their answer, and IMMEDIATELY ask the next question in the EXACT SAME TURN.
   - Never ask "Do you have any questions?". Keep the examination moving forward.
3. {mode_rule}
4. CONCLUSION:
   - Conclude proactively with: "{guide['closing_line']}"
""".strip()


# Backward compatibility default
TECH_INTERVIEW_INSTRUCTIONS = get_interview_instructions(track="tech")
BDA_INTERVIEW_INSTRUCTIONS = get_interview_instructions(track="bda")
INTERVIEW_INSTRUCTIONS = TECH_INTERVIEW_INSTRUCTIONS


# ── Static Warm Greetings, Code Feedback & Farewells (Language-Matched) ───────

def get_candidate_greeting(
    candidate_name: str = "Candidate",
    role_title: str = "Assessment",
    track: str = "tech",
    language_key: str = "hinglish",
    discipline: str = "",
) -> str:
    """Generate a warm, female, zero-LLM greeting addressing candidate by their verified name
    and discipline in the selected language."""
    raw_name = (candidate_name or "Candidate").strip()
    if raw_name and not raw_name.isupper() and not raw_name.startswith("taker_"):
        name = raw_name.title()
    elif raw_name.startswith("taker_"):
        name = "Candidate"
    else:
        name = raw_name or "Candidate"

    role = (role_title or "Oral Assessment").strip()
    disc_key = _resolve_discipline_key(track, discipline)

    # 1. Medicine & Healthcare
    if disc_key == "medical":
        if language_key == "hi-IN":
            return f"नमस्ते {name}! IntervAI पर आपका स्वागत है। मैं आपकी क्लिनिकल परीक्षक नलिनी हूँ। आज हम {role} का क्लिनिकल वाइवा शुरू करेंगे। चलिए सीधे शुरू करते हैं: क्या आप इस केस के लिए अपनी प्राथमिक डायग्नोस्टिक अप्रोच और पेशेंट हिस्ट्री ट्राइएज के बारे में बता सकते हैं?"
        elif language_key == "mr-IN":
            return f"नमस्कार {name}! IntervAI प्लॅटफॉर्मवर आपले स्वागत आहे. मी आज तुमची क्लिनिकल परीक्षक नलिनी आहे. आज आपण {role} साठी क्लिनिकल व्हायव्हा सुरू करूया. चला सुरुवात करूया: या केससाठी तुमची सुरुवातीची डायग्नोस्टिक पद्धत आणि पेशंट हिस्ट्री ट्राइएज कशी असेल ते सांगा?"
        elif language_key == "en-IN":
            return f"Hello {name}! Welcome to IntervAI. I am Professor Nalini, your clinical examiner today. We will be conducting your viva on {role}. Let's begin: could you present your initial diagnostic approach and patient history triage for this case?"
        else:
            return f"Hello {name}! Welcome to IntervAI. Main aaj aapki clinical examiner Nalini hoon. Aaj hum aapka {role} clinical viva conduct karenge. Let's get started: is case ke liye aapki initial diagnostic approach aur patient history triage kya hogi?"

    # 2. Law & Judiciary
    elif disc_key == "law":
        if language_key == "hi-IN":
            return f"नमस्ते {name}! IntervAI पर आपका स्वागत है। मैं आज के ओरल एडवोकेसी एग्ज़ामिनेशन के लिए आपकी जज नलिनी हूँ। चलिए शुरू करते हैं: कृपया अपनी ओपनिंग दलील प्रस्तुत कीजिए और बताइए कि इस मामले में अधिकार क्षेत्र कैसे स्थापित होता है?"
        elif language_key == "mr-IN":
            return f"नमस्कार {name}! IntervAI वर आपले स्वागत आहे. आजच्या ओरल एडव्होकसी परीक्षेसाठी मी तुमची जज नलिनी आहे. चला सुरू करूया: कृपया आपला युक्तिवाद मांडून सांगा की या प्रकरणात अधिकार क्षेत्र कसे सिद्ध होते?"
        elif language_key == "en-IN":
            return f"Hello {name}! Welcome to IntervAI. I am Presiding Judge Nalini for today's oral advocacy examination on {role}. Let's begin: please present your opening proposition and how you establish jurisdiction in this matter."
        else:
            return f"Hello {name}! Welcome to IntervAI. Main aaj ke oral advocacy examination ke liye aapki presiding judge Nalini hoon. Let's get started: please apni opening proposition present kijiye aur batayiye ki is matter mein jurisdiction kaise establish hota hai."

    # 3. Core Engineering (Non-Tech)
    elif disc_key == "core_eng":
        if language_key == "hi-IN":
            return f"नमस्ते {name}! IntervAI पर आपका स्वागत है। मैं आपकी इंजीनियरिंग परीक्षक नलिनी हूँ। आज हम {role} का ओरल वाइवा शुरू करेंगे। चलिए सीधे शुरू करते हैं: क्या आप इस सिस्टम के गवर्निंग फिजिकल प्रिंसिपल्स और डिज़ाइन कंसीडरेशन्स के बारे में बता सकते हैं?"
        elif language_key == "mr-IN":
            return f"नमस्कार {name}! IntervAI वर आपले स्वागत आहे. मी तुमची इंजिनिअरिंग परीक्षक नलिनी आहे. आज आपण {role} चा व्हायव्हा सुरू करूया. चला सुरुवात करूया: या सिस्टीमसाठी मुख्य भौतिक तत्त्वे आणि डिझाइन निकष काय आहेत ते स्पष्ट करा?"
        elif language_key == "en-IN":
            return f"Hello {name}! Welcome to IntervAI. I am Professor Nalini, your engineering examiner today for {role}. Let's get started: could you explain the governing physical principles and design considerations for this system?"
        else:
            return f"Hello {name}! Welcome to IntervAI. Main aapki engineering examiner Nalini hoon. Aaj hum aapka {role} engineering viva conduct karenge. Let's get started: please mujhe is system ke governing physical principles aur design considerations samjhaiye."

    # 4. Management / BDA Sales
    elif disc_key in ("management", "bda"):
        if language_key == "hi-IN":
            return f"नमस्ते {name}! IntervAI पर आपका स्वागत है। मैं आपकी कॉर्पोरेट इवैल्यूएटर हूँ। चलिए सीधे शुरू करते हैं: क्या आप बता सकते हैं कि आपका सॉल्यूशन हमारी कंपनी की कौन-सी मुख्य समस्या हल करता है और आपकी कोर स्ट्रेटेजी क्या है?"
        elif language_key == "mr-IN":
            return f"नमस्कार {name}! IntervAI प्लॅटफॉर्मवर आपले स्वागत आहे. मी आज तुमची कॉर्पोरेट इव्हॅल्युएटर आहे. चला सुरू करूया: कृपया सांगा की तुमचे प्रॉडक्ट आमच्या कंपनीची कोणती प्रमुख समस्या सोडवते आणि तुमची स्ट्रॅटेजी काय आहे?"
        elif language_key == "en-IN":
            return f"Hello {name}! Welcome to IntervAI. I am your corporate evaluator today. Let's get started: please give me a quick walkthrough of what core problem your solution solves and your strategic value proposition."
        else:
            return f"Hello {name}! Welcome to IntervAI. Main aaj aapki corporate evaluator hoon. Let's get started: please give me a quick walkthrough of what core problem your solution solves and your strategic value proposition."

    # 5. Software / Tech Track (Default)
    if language_key == "hi-IN":
        return f"नमस्ते {name}! IntervAI पर आपका स्वागत है। मैं आपकी AI इंटरव्यूअर हूँ। आज हम {role} पद के लिए आपका असेसमेंट करेंगे। चलिए सीधे शुरू करते हैं: क्या आप मुझे अपने टेक्निकल बैकग्राउंड और कोर स्किल्स का एक संक्षिप्त ओवरव्यू दे सकते हैं?"
    elif language_key == "mr-IN":
        return f"नमस्कार {name}! IntervAI प्लॅटफॉर्मवर आपले स्वागत आहे. मी तुमची AI मुलाखतकार आहे. आज आपण {role} पदासाठी असेसमेंट सुरू करूया. चला सुरुवात करूया: कृपया आपल्या टेक्निकल पार्श्वभूमी आणि अनुभवाबद्दल थोडक्यात सांगा?"
    elif language_key == "en-IN":
        return f"Hello {name}! Welcome to IntervAI. I am your AI interviewer today, and we will be conducting your assessment for {role}. Let's get started: could you give me a brief overview of your technical background and key strengths?"
    else:
        return f"Hello {name}! Welcome to IntervAI. Main aapki AI interviewer hoon. Aaj hum aapka {role} assessment conduct karenge. Let's get started: please give me a brief overview of your technical background and key strengths."


def get_code_eval_message(
    status: str,
    language_key: str = "hinglish",
    clean_err: str = "",
    remaining: int = 1,
) -> str:
    """Return language-matched spoken feedback for code submissions (correct, exhausted, or compiler diagnostic)."""
    if status == "correct":
        if language_key == "mr-IN":
            return "तुमचा कोड कंपायलर चेकमध्ये पास झाला आहे आणि अगदी बरोबर आहे! आता कृपया मला सांगा: तुमच्या सोल्यूशनची time आणि space complexity काय आहे?"
        elif language_key == "hi-IN":
            return "आपका कोड कंपाइलर चेक में पास हो गया है और बिल्कुल सही है! अब कृपया मुझे बताइए: आपके सोल्यूशन की time और space complexity क्या है?"
        elif language_key == "en-IN":
            return "Your code passed the compiler check and looks correct! Now, could you briefly explain the time and space complexity of your solution?"
        else:
            return "Code passed compiler check and looks correct! Ab please mujhe orally samjhaiye: aapke solution ki time aur space complexity kya hai?"

    elif status == "exhausted":
        if language_key == "mr-IN":
            return "तुमचे सर्व कोडिंग अटेम्प्ट्स पूर्ण झाले आहेत. मी कोड एडिटर बंद करत आहे, आता आपण पुढच्या तोंडी प्रश्नांकडे वळूया."
        elif language_key == "hi-IN":
            return "आपके सभी कोडिंग प्रयास पूरे हो गए हैं। मैंने कोड एडिटर बंद कर दिया है, अब हम मौखिक प्रश्नों पर आगे बढ़ते हैं।"
        elif language_key == "en-IN":
            return "All coding attempts have been used. I have closed the code editor—let's move on to the oral viva questions."
        else:
            return "All attempts have been used. Code editor band kar diya hai, ab hum oral viva questions par move karte hain."

    elif status == "error":
        if language_key == "mr-IN":
            return "तुमचा कोड मिळाला, पण तपासताना तांत्रिक अडचण आली. चला आपण पुढच्या भागाकडे वळूया."
        elif language_key == "hi-IN":
            return "आपका कोड मिल गया है, लेकिन मूल्यांकन में एक तकनीकी समस्या आई। चलिए आगे बढ़ते हैं।"
        else:
            return "I received your code, but I encountered an error evaluating it. Let's move on."

    else:
        # status == "incorrect"
        if language_key == "mr-IN":
            return f"Compiler check: {clean_err}. तुमच्याकडे अजून {remaining} अटेम्प्ट बाकी आहेत, कृपया एडिटरमध्ये कोड दुरुस्त करा."
        elif language_key == "hi-IN":
            return f"Compiler check: {clean_err}. आपके पास अभी {remaining} प्रयास बाकी हैं, कृपया एडिटर में इसे ठीक कीजिए।"
        elif language_key == "en-IN":
            return f"Compiler check: {clean_err}. You have {remaining} attempt{'s' if remaining > 1 else ''} remaining, please fix it in the editor."
        else:
            return f"Compiler check: {clean_err}. Aapke paas {remaining} attempt{'s' if remaining > 1 else ''} baaki hain, please editor mein fix kijiye."


def get_random_greeting(
    language_key: str = "hinglish",
    candidate_name: str = "Candidate",
    role_title: str = "Software Engineer",
) -> str:
    """Select a fast, token-free greeting matched to the candidate's language and name."""
    return get_candidate_greeting(
        candidate_name=candidate_name,
        role_title=role_title,
        track="tech",
        language_key=language_key,
    )


FAREWELLS_POOL = [
    "Aapka interview complete ho chuka hai aur report successfully submit ho gayi hai. Thank you, and all the best!",
    "Your interview is over and your report has been successfully submitted. Thank you, and all the best!",
]


def get_random_farewell(language_key: str = "hinglish") -> str:
    """Select a polite, language-matched closing message."""
    guide = _get_lang_guide(language_key, language_key)
    return guide["closing_line"]
