
import sqlite3
import json
import os
from contextlib import closing
from pathlib import Path
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")
DB_PATH = Path(
    os.getenv("DATABASE_PATH", str(Path(__file__).resolve().parent.parent / "promptforge.db"))
)


def _connect():
    if DATABASE_URL:
        import psycopg
        from psycopg.rows import dict_row

        return psycopg.connect(DATABASE_URL, row_factory=dict_row)
    if os.getenv("VERCEL"):
        raise RuntimeError("Set DATABASE_URL to a managed PostgreSQL database on Vercel.")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    schema = """
        CREATE TABLE IF NOT EXISTS runs (
            id BIGSERIAL PRIMARY KEY,
            task TEXT NOT NULL,
            final_answer TEXT NOT NULL,
            winner TEXT,
            final_score DOUBLE PRECISION,
            metadata TEXT,
            created_at TEXT
        )
    """ if DATABASE_URL else """
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            final_answer TEXT NOT NULL,
            winner TEXT,
            final_score REAL,
            metadata TEXT,
            created_at TEXT
        )
    """
    with closing(_connect()) as conn, conn:
        conn.execute(schema)


def save_run(task, final_answer, winner, final_score, metadata):
    placeholder = "%s" if DATABASE_URL else "?"
    query = f"""
        INSERT INTO runs
        (task, final_answer, winner, final_score, metadata, created_at)
        VALUES ({", ".join([placeholder] * 6)})
    """
    with closing(_connect()) as conn, conn:
        conn.execute(query, (
            task,
            final_answer,
            winner,
            final_score,
            metadata,
            datetime.now().isoformat(),
        ))


def get_runs():
    with closing(_connect()) as conn, conn:
        rows = conn.execute("SELECT * FROM runs ORDER BY id DESC").fetchall()

    results = []
    for row in rows:
        item = dict(row)
        try:
            item["metadata"] = json.loads(item["metadata"] or "{}")
        except (json.JSONDecodeError, TypeError):
            pass
        results.append(item)

    return results
