import json
import sqlite3
from typing import Any, Dict, List, Optional
from backend import config
from backend.seed_data import PYTHON_SEED_EMAILS


def get_connection():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL DEFAULT 'Alex Rivera',
        email TEXT NOT NULL DEFAULT 'alex.rivera@university.edu',
        department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
        academic_year TEXT NOT NULL DEFAULT '3rd Year',
        skills TEXT NOT NULL DEFAULT 'Python, TypeScript, Machine Learning, Distributed Systems',
        interests TEXT NOT NULL DEFAULT 'AI/ML, Hackathons, Open Source, Cloud Architecture',
        gpa TEXT NOT NULL DEFAULT '3.85',
        min_urgency_alert INTEGER NOT NULL DEFAULT 75
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL UNIQUE,
        subject TEXT NOT NULL,
        sender TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        received_at TEXT NOT NULL,
        snippet TEXT NOT NULL,
        body TEXT NOT NULL,
        is_processed INTEGER NOT NULL DEFAULT 1
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email_id INTEGER,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        organization TEXT NOT NULL,
        summary TEXT NOT NULL,
        deadline_text TEXT,
        eligibility TEXT DEFAULT 'Open to all students',
        academic_years TEXT DEFAULT 'All',
        branches TEXT DEFAULT 'All Branches',
        registration_url TEXT,
        required_actions TEXT DEFAULT '[]',
        urgency_score INTEGER DEFAULT 50,
        match_score INTEGER DEFAULT 75,
        user_status TEXT DEFAULT 'new',
        is_bookmarked INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        FOREIGN KEY(email_id) REFERENCES emails(id)
    )
    """)

    # Seed initial student if table is empty
    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO students (name, email, department, academic_year, skills, interests, gpa, min_urgency_alert)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Alex Rivera",
            "alex.rivera@university.edu",
            "Computer Science & Engineering",
            "3rd Year",
            "Python, TypeScript, Machine Learning, Distributed Systems",
            "AI/ML, Hackathons, Open Source, Cloud Architecture",
            "3.85",
            75,
        ))

    # Seed initial emails if empty
    cursor.execute("SELECT COUNT(*) FROM emails")
    if cursor.fetchone()[0] == 0:
        for item in PYTHON_SEED_EMAILS:
            cursor.execute("""
            INSERT OR IGNORE INTO emails (message_id, subject, sender, sender_email, received_at, snippet, body)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                item["message_id"],
                item["subject"],
                item["sender"],
                item["sender_email"],
                item["received_at"],
                item["snippet"],
                item["body"],
            ))
            email_id = cursor.lastrowid
            cursor.execute("""
            INSERT INTO opportunities (
                email_id, title, category, organization, summary, deadline_text,
                eligibility, academic_years, branches, registration_url,
                required_actions, urgency_score, match_score, user_status, is_bookmarked
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                email_id,
                item["subject"].replace("HackMIT 2026 Applications Now Open! ⚡ ", "HackMIT 2026").replace("Google Summer 2027 ", "Google Summer 2027 ").strip(),
                item["category"],
                item["organization"],
                item["snippet"],
                item["deadline_text"],
                item["eligibility"],
                item["academic_years"],
                item["branches"],
                item["registration_url"],
                json.dumps(item["required_actions"]),
                item["urgency_score"],
                item["match_score"],
                "new",
                0,
            ))

    conn.commit()
    conn.close()
