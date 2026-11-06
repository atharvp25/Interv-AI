import os
import time
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Load .env from project root
load_dotenv(find_dotenv())

from gnani.tts import GnaniTTSClient
from gnani.stt import GnaniSTTClient

def run_smoke_test():
    api_key = os.environ.get("GNANI_API_KEY")
    if not api_key:
        print("❌ Error: GNANI_API_KEY not found in environment!")
        return

    print("=" * 65)
    print("🧪 GNANI AI SMOKE TEST: Timbre (TTS) & Prisma (STT)")
    print(f"🔑 Using API Key: {api_key[:10]}...{api_key[-5:]}")
    print("=" * 65)

    test_dir = Path(__file__).resolve().parent
    audio_output = test_dir / "output_greeting.wav"

    # Hinglish test prompt
    prompt_text = "Namaste! Welcome to your interview. Main aapka AI interviewer hoon. Kripya apna naam bataiye."
    print(f"\n📝 Test Text (Hinglish):\n   \"{prompt_text}\"")

    # ─────────────────────────────────────────────────────────────
    # TEST 1: Gnani Timbre Text-to-Speech (TTS)
    # ─────────────────────────────────────────────────────────────
    print("\n▶ [1/2] Testing Gnani Timbre TTS...")
    tts_client = GnaniTTSClient(api_key=api_key)
    
    start_tts = time.perf_counter()
    try:
        audio_bytes = tts_client.synthesize(
            text=prompt_text,
            voice="Nalini",
            model="timbre-v2.5",
            language="hi-IN",
            output_file=audio_output
        )
        tts_duration_ms = (time.perf_counter() - start_tts) * 1000
        file_size_kb = len(audio_bytes) / 1024
        
        print(f"✅ TTS Success!")
        print(f"   ⏱️ Round-trip Latency: {tts_duration_ms:.1f} ms")
        print(f"   📦 Audio Size: {file_size_kb:.1f} KB")
        print(f"   💾 Saved to: {audio_output}")
    except Exception as e:
        print(f"❌ TTS Failed: {e}")
        return

    # ─────────────────────────────────────────────────────────────
    # TEST 2: Gnani Prisma Speech-to-Text (STT)
    # ─────────────────────────────────────────────────────────────
    print("\n▶ [2/2] Testing Gnani Prisma STT (Transcribing the generated audio)...")
    stt_client = GnaniSTTClient(api_key=api_key)
    
    start_stt = time.perf_counter()
    try:
        stt_result = stt_client.transcribe(
            audio=str(audio_output),
            language_code="hi-IN",
            language_candidates=["en-IN", "hi-IN"],
            keywords=["AI interviewer", "interview", "Namaste"]
        )
        stt_duration_ms = (time.perf_counter() - start_stt) * 1000
        
        transcript = stt_result.get("transcript", stt_result)
        print(f"✅ STT Success!")
        print(f"   ⏱️ Round-trip Latency: {stt_duration_ms:.1f} ms")
        print(f"   🎙️ Transcribed Text: \"{transcript}\"")
        print(f"   📊 Full Response Data: {stt_result}")
    except Exception as e:
        print(f"❌ STT Failed: {e}")
        return

    print("\n" + "=" * 65)
    print("🎉 ALL GNANI SMOKE TESTS PASSED!")
    print(f"Total Pipeline Test Time (TTS + STT): {(tts_duration_ms + stt_duration_ms):.1f} ms")
    print("=" * 65)

if __name__ == "__main__":
    run_smoke_test()

