import re
from typing import Any, Dict, List


def extract_opportunity(subject: str, sender: str, body: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    lower = f"{subject} {body}".lower()

    # Category determination
    category = "Campus Event"
    if any(k in lower for k in ["hackathon", "hackmit", "coding challenge", "ideathon"]):
        category = "Hackathon"
    elif any(k in lower for k in ["internship", "intern", "co-op", "summer 202"]):
        category = "Internship"
    elif any(k in lower for k in ["scholarship", "fellowship", "grant", "tuition award"]):
        category = "Scholarship"
    elif any(k in lower for k in ["research", "reu", "phd", "laboratory", "faculty lab"]):
        category = "Research"
    elif any(k in lower for k in ["workshop", "bootcamp", "hands-on", "masterclass"]):
        category = "Workshop"
    elif any(k in lower for k in ["homework", "assignment", "gradescope", "due date", "withdrawal"]):
        category = "Academic Deadline"

    # URL extraction
    url_match = re.search(r"https?://[^\s\"'<>]+", body)
    registration_url = url_match.group(0) if url_match else ""

    # Organization
    organization = sender.split("<")[0].strip() or "University Partner"
    if "google" in lower:
        organization = "Google"
    elif "mit" in lower:
        organization = "MIT"
    elif "jane street" in lower:
        organization = "Jane Street"

    # Deadline Text
    date_match = re.search(r"(?:deadline|due|by|before)\s*([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?,? \d{4})", body, re.IGNORECASE)
    deadline_text = date_match.group(1) if date_match else "Within 7 Days"

    # Urgency Score
    urgency_score = 65
    if any(k in lower for k in ["urgent", "reminder", "final notice", "extension", "last day"]):
        urgency_score = 92
    elif "october" in lower:
        urgency_score = 85

    # Match Score with Student Profile
    skills = [s.strip().lower() for s in profile.get("skills", "").split(",")]
    interests = [i.strip().lower() for i in profile.get("interests", "").split(",")]
    dept = profile.get("department", "").lower()

    match_score = 70
    for s in skills:
        if s and s in lower:
            match_score += 6
    for i in interests:
        if i and i in lower:
            match_score += 7
    if dept and ("computer" in lower or "engineering" in lower):
        match_score += 10
    match_score = min(99, max(50, match_score))

    # Required actions
    actions = []
    if registration_url:
        actions.append(f"Complete application link: {registration_url[:35]}...")
    if "resume" in lower:
        actions.append("Upload updated 1-page PDF resume")
    if "transcript" in lower:
        actions.append("Submit college transcript")
    if not actions:
        actions.append("Review instructions and respond before deadline")

    # Summary
    first_sentence = [s.strip() for s in body.split("\n") if len(s.strip()) > 20]
    summary = (first_sentence[0][:150] + "...") if first_sentence else subject

    return {
        "title": subject.replace("Re: ", "").replace("Fwd: ", "").strip(),
        "category": category,
        "organization": organization,
        "summary": summary,
        "deadline_text": deadline_text,
        "eligibility": "Open to all enrolled students" if "gpa" not in lower else "Minimum GPA requirement applies",
        "academic_years": "2nd, 3rd, 4th Year" if "senior" in lower else "All",
        "branches": "Computer Science & Engineering and related",
        "registration_url": registration_url,
        "required_actions": actions,
        "urgency_score": urgency_score,
        "match_score": match_score,
    }
