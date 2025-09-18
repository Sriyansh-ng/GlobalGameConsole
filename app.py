from flask import Flask, render_template
import os
import threading

app = Flask(__name__)

# Simple file-backed counter with a process-local lock
COUNTER_LOCK = threading.Lock()
COUNTER_DIR = os.path.join(os.path.dirname(__file__), "data")
COUNTER_FILE = os.path.join(COUNTER_DIR, "hits.txt")


def _read_hits() -> int:
    try:
        with open(COUNTER_FILE, "r", encoding="utf-8") as f:
            raw = f.read().strip()
            return int(raw) if raw else 0
    except FileNotFoundError:
        return 0
    except ValueError:
        # If file is corrupted, reset to 0 safely
        return 0


def increment_and_get_hits() -> int:
    os.makedirs(COUNTER_DIR, exist_ok=True)
    with COUNTER_LOCK:
        current = _read_hits() + 1
        with open(COUNTER_FILE, "w", encoding="utf-8") as f:
            f.write(str(current))
        return current


@app.route("/")
def index():
    hits = increment_and_get_hits()
    return render_template("index.html", hit_count=hits)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
