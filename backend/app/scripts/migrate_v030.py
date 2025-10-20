"""
Lightweight SQLite migration for v0.3.0.
Adds recurrence-related columns if they don't exist.
Run once after upgrading to 0.3.0:
    docker compose exec api python -m app.scripts.migrate_v030
"""

import sqlite3
from pathlib import Path

DB_PATH = Path("/app/data/app.db")

COLUMNS = {
    "is_recurring": "INTEGER DEFAULT 0",
    "recurrence": "TEXT",
    "recur_interval": "INTEGER",
    "recur_dow": "INTEGER",
    "recur_dom": "INTEGER",
    "recur_until": "TEXT",
    "last_scheduled_at": "TEXT",
}

def ensure_columns():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found at {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # fetch existing column names
    cur.execute("PRAGMA table_info(task)")
    existing = {row[1] for row in cur.fetchall()}

    for name, ddl in COLUMNS.items():
        if name not in existing:
            print(f"Adding column '{name}' to task table …")
            cur.execute(f"ALTER TABLE task ADD COLUMN {name} {ddl}")
        else:
            print(f"Column '{name}' already exists, skipping.")

    conn.commit()
    conn.close()
    print("Migration complete ✅")

if __name__ == "__main__":
    ensure_columns()
