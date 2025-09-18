from flask import Flask, render_template
import os
import sqlite3

app = Flask(__name__)

# Data directory and paths (configurable for persistence across deployments)
BASE_DIR = os.path.dirname(__file__)
COUNTER_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(COUNTER_DIR, exist_ok=True)

# Use HIT_COUNTER_DB env var to point to a persistent volume (e.g., /data/hits.db)
DB_PATH = os.environ.get("HIT_COUNTER_DB", os.path.join(COUNTER_DIR, "hits.db"))

# Legacy text file support (seed existing count if present)
LEGACY_COUNTER_FILE = os.path.join(COUNTER_DIR, "hits.txt")

def _init_db(conn: sqlite3.Connection) -> None:
    # Basic setup; WAL improves concurrency with multiple workers
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS counter (
            id   INTEGER PRIMARY KEY CHECK (id = 1),
            hits INTEGER NOT NULL
        );
        """
    )

def _init_db(conn: sqlite3.Connection) -> None:
    # Basic setup; WAL improves concurrency with multiple workers
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS counter (
            id   INTEGER PRIMARY KEY CHECK (id = 1),
            hits INTEGER NOT NULL
        );
        """
    )


def _read_legacy_hits() -> int | None:
    try:
        with open(LEGACY_COUNTER_FILE, "r", encoding="utf-8") as f:
            raw = f.read().strip()
            return int(raw) if raw else 0
    except FileNotFoundError:
        return None
    except ValueError:
        # Corrupted or invalid, ignore legacy
        return None


def increment_and_get_hits() -> int:
    # Open a short-lived connection per request
    with sqlite3.connect(DB_PATH, timeout=30, isolation_level=None) as conn:
        _init_db(conn)

        # Start an immediate transaction to ensure atomic increment
        conn.execute("BEGIN IMMEDIATE;")
        try:
            cur = conn.execute("UPDATE counter SET hits = hits + 1 WHERE id = 1;")
            if cur.rowcount == 0:
                # Seed from legacy file if present, otherwise start at 0 then increment to 1
                legacy = _read_legacy_hits()
                start_val = (legacy or 0) + 1
                conn.execute("INSERT INTO counter (id, hits) VALUES (1, ?);", (start_val,))
            conn.execute("COMMIT;")
        except Exception:
            conn.execute("ROLLBACK;")
            raise

        row = conn.execute("SELECT hits FROM counter WHERE id = 1;").fetchone()
        return int(row[0]) if row else 0


@app.route("/")
def index():
    hits = increment_and_get_hits()
    return render_template("index.html", hit_count=hits)


if __name__ == "__main__":
    # Bind to all interfaces for container use
    app.run(host="0.0.0.0", port=5000)
