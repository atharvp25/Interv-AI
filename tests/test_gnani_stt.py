import os
import time
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

from gnani.stt import GnaniSTTClient

def test_stt_only():
    api_key = os.environ.get("GNANI_API_KEY")
    if not api_key:
        print("❌ Error: GNANI_API_KEY not found in environment!")
        return

    test_dir = Path(__file__).resolve().parent
    audio_path = test_dir / "output_greeting.wav"

    if not audio_path.exists():
        print(f"❌ Error: {audio_path} does not exist!")
        return

    print("=" * 65)
    print("🎙️ GNANI PRISMA v3.0 STT TEST (Offline Audio -> Text)")
    print(f"📁 Audio Input: {audio_path.name} ({audio_path.stat().st_size / 1024:.1f} KB)")
    print("=" * 65)

    stt_client = GnaniSTTClient(api_key=api_key)

    start_stt = time.perf_counter()
    try:
        # Note: In Prisma v3.0, language_candidates requires language_code='indic-auto'
        stt_result = stt_client.transcribe(
            audio=str(audio_path),
            model="prisma-v3.0",
            language_code="indic-auto",
            language_candidates=["en-IN", "hi-IN"],
            keywords=["interview", "AI interviewer", "Namaste"]
        )
        stt_duration_ms = (time.perf_counter() - start_stt) * 1000

        transcript = stt_result.get("transcript", stt_result)
        print("✅ STT Success!")
        print(f"   ⏱️ Round-trip Latency: {stt_duration_ms:.1f} ms")
        print(f"   🗣️ Transcribed Text: \"{transcript}\"")
        print(f"   📊 Model Used: {stt_result.get('model', 'prisma-v3.0')}")
        print(f"   🌐 Detected Language: {stt_result.get('language_code', 'unknown')}")
        print("=" * 65)
    except Exception as e:
        print(f"❌ STT Failed: {e}")

if __name__ == "__main__":
    test_stt_only()

