from typing import List, Optional
from pydantic import BaseModel, Field


class StudentProfileModel(BaseModel):
    name: str = "Alex Rivera"
    email: str = "alex.rivera@university.edu"
    department: str = "Computer Science & Engineering"
    academicYear: str = Field(default="3rd Year", alias="academic_year")
    skills: str = "Python, TypeScript, Machine Learning, Distributed Systems"
    interests: str = "AI/ML, Hackathons, Open Source, Cloud Architecture"
    gpa: str = "3.85"
    minUrgencyAlert: int = Field(default=75, alias="min_urgency_alert")

    class Config:
        populate_by_name = True


class EmailIngestRequest(BaseModel):
    subject: str
    sender: str
    body: str


class OpportunityUpdate(BaseModel):
    userStatus: Optional[str] = None
    isBookmarked: Optional[bool] = None
    notes: Optional[str] = None
