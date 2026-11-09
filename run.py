import subprocess
import sys
import os
import signal
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Auto-detect project virtual environment python if available
    venv_python_win = os.path.join(root_dir, ".venv", "Scripts", "python.exe")
    venv_python_posix = os.path.join(root_dir, ".venv", "bin", "python")
    if os.path.exists(venv_python_win):
        python_exe = venv_python_win
    elif os.path.exists(venv_python_posix):
        python_exe = venv_python_posix
    else:
        python_exe = sys.executable

    print("=" * 60)
    print("🚀 Starting IntervAI Ecosystem (Backend + Agent + Frontend)")
    print(f"📦 Environment Python: {python_exe}")
    print("=" * 60)

    processes = []

    try:
        # 1. Start FastAPI Backend Server
        print("▶ [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
        api_proc = subprocess.Popen(
            [python_exe, "-m", "uvicorn", "server.app:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
            cwd=root_dir
        )
        processes.append(("FastAPI Backend", api_proc))

        time.sleep(1)

        # 2. Start LiveKit Agent Worker
        print("▶ [2/3] Starting LiveKit Voice Agent Worker ...")
        agent_proc = subprocess.Popen(
            [python_exe, "-m", "server.agent.worker", "dev"],
            cwd=root_dir
        )
        processes.append(("LiveKit Agent", agent_proc))

        time.sleep(1)

        # 3. Start React Frontend (Vite)
        print("▶ [3/3] Starting React Frontend on http://localhost:5173 ...")
        frontend_dir = os.path.join(root_dir, "frontend")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        fe_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=frontend_dir
        )
        processes.append(("React Frontend", fe_proc))

        print("\n" + "=" * 60)
        print("✅ ALL SYSTEMS GO! Press Ctrl+C in this terminal to stop all.")
        print("=" * 60 + "\n")

        # Keep parent script running and monitor children
        reported_exits = set()
        while True:
            for name, p in processes:
                if p.poll() is not None and name not in reported_exits:
                    print(f"⚠️ Process {name} exited with code {p.returncode}")
                    reported_exits.add(name)
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Stopping all services...")
    finally:
        for name, p in processes:
            if p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    p.kill()
        print("✓ All processes stopped cleanly.")

if __name__ == "__main__":
    main()

