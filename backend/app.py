import json
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import get_connection, init_db
from backend.extractor import extract_opportunity
from backend.models import EmailIngestRequest, OpportunityUpdate, StudentProfileModel

app = FastAPI(title="Smart Inbox API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()


@app.get("/api/stats")
def get_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM emails")
    total_emails = cursor.fetchone()[0]

    cursor.execute("SELECT id, category, urgency_score, match_score FROM opportunities")
    rows = cursor.fetchall()
    conn.close()

    total_opps = len(rows)
    urgent_count = sum(1 for r in rows if r["urgency_score"] >= 80)
    high_match_count = sum(1 for r in rows if r["match_score"] >= 85)

    categories = {}
    for r in rows:
        cat = r["category"]
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "totalEmails": total_emails,
        "totalOpportunities": total_opps,
        "urgentCount": urgent_count,
        "highMatchCount": high_match_count,
        "categories": categories,
    }


@app.get("/api/profile")
def get_profile():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {}
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "department": row["department"],
        "academicYear": row["academic_year"],
        "skills": row["skills"],
        "interests": row["interests"],
        "gpa": row["gpa"],
        "minUrgencyAlert": row["min_urgency_alert"],
    }


@app.put("/api/profile")
def update_profile(prof: StudentProfileModel):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE students
    SET name = ?, email = ?, department = ?, academic_year = ?, skills = ?, interests = ?, gpa = ?, min_urgency_alert = ?
    WHERE id = 1
    """, (
        prof.name,
        prof.email,
        prof.department,
        prof.academicYear,
        prof.skills,
        prof.interests,
        prof.gpa,
        prof.minUrgencyAlert,
    ))
    conn.commit()
    conn.close()
    return prof.dict()


@app.get("/api/opportunities")
def list_opportunities(
    category: Optional[str] = Query("All"),
    urgency: Optional[str] = Query("All"),
    status: Optional[str] = Query("All"),
    search: Optional[str] = Query(""),
    sort: Optional[str] = Query("urgency"),
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM opportunities")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        item = {
            "id": r["id"],
            "emailId": r["email_id"],
            "title": r["title"],
            "category": r["category"],
            "organization": r["organization"],
            "summary": r["summary"],
            "deadlineText": r["deadline_text"],
            "eligibility": r["eligibility"],
            "academicYears": r["academic_years"],
            "branches": r["branches"],
            "registrationUrl": r["registration_url"],
            "requiredActions": r["required_actions"],
            "urgencyScore": r["urgency_score"],
            "matchScore": r["match_score"],
            "userStatus": r["user_status"],
            "isBookmarked": bool(r["is_bookmarked"]),
            "notes": r["notes"],
        }
        results.append(item)

    # Filter
    if category and category != "All":
        results = [x for x in results if x["category"] == category]

    if urgency and urgency != "All":
        if urgency == "Critical":
            results = [x for x in results if x["urgencyScore"] >= 85]
        elif urgency == "High":
            results = [x for x in results if 70 <= x["urgencyScore"] < 85]
        elif urgency == "Medium":
            results = [x for x in results if 50 <= x["urgencyScore"] < 70]
        elif urgency == "Low":
            results = [x for x in results if x["urgencyScore"] < 50]

    if status and status != "All":
        if status == "Bookmarked":
            results = [x for x in results if x["isBookmarked"]]
        else:
            results = [x for x in results if x["userStatus"] == status.lower()]

    if search:
        q = search.lower().strip()
        results = [
            x for x in results
            if q in f"{x['title']} {x['organization']} {x['summary']} {x['eligibility']}".lower()
        ]

    # Sort
    if sort == "urgency":
        results.sort(key=lambda x: x["urgencyScore"], reverse=True)
    elif sort == "match":
        results.sort(key=lambda x: x["matchScore"], reverse=True)
    elif sort == "recent":
        results.sort(key=lambda x: x["id"], reverse=True)

    return results


@app.patch("/api/opportunities/{opp_id}")
def update_opportunity(opp_id: int, payload: OpportunityUpdate):
    conn = get_connection()
    cursor = conn.cursor()

    if payload.userStatus is not None:
        cursor.execute("UPDATE opportunities SET user_status = ? WHERE id = ?", (payload.userStatus, opp_id))
    if payload.isBookmarked is not None:
        cursor.execute("UPDATE opportunities SET is_bookmarked = ? WHERE id = ?", (1 if payload.isBookmarked else 0, opp_id))
    if payload.notes is not None:
        cursor.execute("UPDATE opportunities SET notes = ? WHERE id = ?", (payload.notes, opp_id))

    conn.commit()
    cursor.execute("SELECT * FROM opportunities WHERE id = ?", (opp_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    return {
        "id": row["id"],
        "title": row["title"],
        "userStatus": row["user_status"],
        "isBookmarked": bool(row["is_bookmarked"]),
        "notes": row["notes"],
    }


@app.post("/api/emails/analyze")
def analyze_email(req: EmailIngestRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students LIMIT 1")
    prof_row = cursor.fetchone()
    prof_dict = dict(prof_row) if prof_row else {}

    extracted = extract_opportunity(req.subject, req.sender, req.body, prof_dict)

    # Save email
    cursor.execute("""
    INSERT INTO emails (message_id, subject, sender, sender_email, received_at, snippet, body)
    VALUES (?, ?, ?, ?, datetime('now'), ?, ?)
    """, (
        f"msg-{int(Path('/proc/uptime').stat().st_mtime if Path('/proc/uptime').exists() else 1000)}-{req.subject[:10]}",
        req.subject,
        req.sender,
        req.sender.split("<")[-1].replace(">", "").strip(),
        req.body[:150] + "...",
        req.body,
    ))
    email_id = cursor.lastrowid

    # Save opportunity
    cursor.execute("""
    INSERT INTO opportunities (
        email_id, title, category, organization, summary, deadline_text,
        eligibility, academic_years, branches, registration_url,
        required_actions, urgency_score, match_score, user_status, is_bookmarked
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 0)
    """, (
        email_id,
        extracted["title"],
        extracted["category"],
        extracted["organization"],
        extracted["summary"],
        extracted["deadline_text"],
        extracted["eligibility"],
        extracted["academic_years"],
        extracted["branches"],
        extracted["registration_url"],
        json.dumps(extracted["required_actions"]),
        extracted["urgency_score"],
        extracted["match_score"],
    ))
    opp_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "success": True,
        "emailId": email_id,
        "opportunityId": opp_id,
        "extracted": extracted,
    }


@app.get("/api/emails")
def list_emails():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emails ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "messageId": r["message_id"],
            "subject": r["subject"],
            "sender": r["sender"],
            "senderEmail": r["sender_email"],
            "receivedAt": r["received_at"],
            "snippet": r["snippet"],
            "body": r["body"],
        }
        for r in rows
    ]


@app.get("/api/digest")
def get_digest():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students LIMIT 1")
    prof = cursor.fetchone()
    cursor.execute("SELECT * FROM opportunities ORDER BY urgency_score DESC")
    rows = cursor.fetchall()
    conn.close()

    urgent = [r for r in rows if r["urgency_score"] >= 80]
    top_matches = [r for r in rows if r["match_score"] >= 85]

    return {
        "date": "Today",
        "greeting": f"Good morning, {prof['name'].split()[0] if prof else 'Student'}!",
        "overview": f"We analyzed your recent college communications and identified {len(urgent)} urgent deadlines requiring attention, along with {len(top_matches)} high-match recommendations.",
        "urgentDeadlines": [
            {
                "title": r["title"],
                "category": r["category"],
                "organization": r["organization"],
                "deadlineText": r["deadline_text"],
                "urgencyScore": r["urgency_score"],
                "action": json.loads(r["required_actions"] or "[]")[0] if json.loads(r["required_actions"] or "[]") else "Review application",
            }
            for r in urgent
        ],
        "recommendedPicks": [
            {
                "title": r["title"],
                "category": r["category"],
                "matchScore": r["match_score"],
                "organization": r["organization"],
                "summary": r["summary"],
                "link": r["registration_url"],
            }
            for r in top_matches
        ],
        "stats": {
            "activeOpportunities": len(rows),
            "urgentCount": len(urgent),
            "topMatchCount": len(top_matches),
        },
    }


# Mount static assets if public directory exists
public_path = Path(__file__).resolve().parent.parent / "public"
if public_path.exists():
    app.mount("/", StaticFiles(directory=str(public_path), html=True), name="static")
