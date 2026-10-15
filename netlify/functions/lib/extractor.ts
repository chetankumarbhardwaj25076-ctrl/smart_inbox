import { GoogleGenAI } from "@google/genai";

export interface StudentProfile {
  name?: string;
  email?: string;
  department?: string;
  academicYear?: string;
  skills?: string;
  interests?: string;
  gpa?: string;
}

export interface ExtractedOpportunity {
  title: string;
  category: string; // Hackathon, Internship, Scholarship, Research, Workshop, Campus Event, Academic Deadline
  organization: string;
  summary: string;
  deadlineText: string;
  deadlineIso: string | null;
  eligibility: string;
  academicYears: string;
  branches: string;
  registrationUrl: string;
  requiredActions: string[];
  urgencyScore: number;
  matchScore: number;
}

export async function extractOpportunityFromEmail(
  subject: string,
  sender: string,
  body: string,
  profile: StudentProfile
): Promise<ExtractedOpportunity> {
  // First, attempt LLM extraction via Netlify AI Gateway if credentials exist
  if (process.env.GEMINI_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY) {
    try {
      const client = new GoogleGenAI(
        process.env.NETLIFY_AI_GATEWAY_KEY && !process.env.GEMINI_API_KEY
          ? {
              apiKey: process.env.NETLIFY_AI_GATEWAY_KEY,
              httpOptions: { baseUrl: process.env.NETLIFY_AI_GATEWAY_URL?.replace(/\/$/, "") }
            }
          : {}
      );

      const prompt = `You are an AI assistant designed for university students to analyze incoming academic and opportunity emails.
Extract structured metadata from the email below.

Email Details:
Sender: ${sender}
Subject: ${subject}
Body:
${body}

Student Profile:
Department/Major: ${profile.department || "Computer Science & Engineering"}
Academic Year: ${profile.academicYear || "3rd Year"}
Skills: ${profile.skills || "Python, Machine Learning, Web Dev"}
Interests: ${profile.interests || "AI/ML, Hackathons, Open Source"}

Return a pure JSON object (no markdown code blocks, just raw JSON) with these exact keys:
{
  "title": "Clear concise opportunity or notice title",
  "category": "One of: Hackathon | Internship | Scholarship | Research | Workshop | Campus Event | Academic Deadline",
  "organization": "Sponsoring company, lab, or university department",
  "summary": "2-sentence high-impact summary of what this is and what students gain",
  "deadline_text": "Human-readable deadline (e.g., Oct 24, 2026, 11:59 PM EST) or 'Not Specified'",
  "deadline_iso": "ISO-8601 date YYYY-MM-DDTHH:MM:SSZ or null if unknown",
  "eligibility": "Eligibility criteria (GPA, citizenship, year, prerequisites)",
  "academic_years": "Target years, e.g. '1st, 2nd, 3rd Year' or 'All'",
  "branches": "Eligible majors/departments, e.g. 'Computer Science, Electrical' or 'All Branches'",
  "registration_url": "Direct application/form URL extracted or empty string",
  "required_actions": ["Array", "of", "concrete", "action", "items"],
  "urgency_score": 1-100 integer reflecting deadline proximity and consequence,
  "match_score": 1-100 integer evaluating fit with the student profile
}`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const responseText = response.text ? response.text.trim() : "";
      const cleanedJson = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        title: parsed.title || subject,
        category: parsed.category || "Campus Event",
        organization: parsed.organization || sender,
        summary: parsed.summary || subject,
        deadlineText: parsed.deadline_text || "See email",
        deadlineIso: parsed.deadline_iso || null,
        eligibility: parsed.eligibility || "Open to all students",
        academicYears: parsed.academic_years || "All",
        branches: parsed.branches || "All Branches",
        registrationUrl: parsed.registration_url || extractFirstUrl(body),
        requiredActions: Array.isArray(parsed.required_actions) && parsed.required_actions.length > 0
          ? parsed.required_actions
          : ["Review details and apply before deadline"],
        urgencyScore: typeof parsed.urgency_score === "number" ? parsed.urgency_score : 70,
        matchScore: typeof parsed.match_score === "number" ? parsed.match_score : 80
      };
    } catch (err) {
      console.warn("AI Gateway inference skipped or error, falling back to rule-based extractor:", err);
    }
  }

  // Fallback Rule-Based NLP Extractor
  return fallbackRuleExtractor(subject, sender, body, profile);
}

function extractFirstUrl(text: string): string {
  const match = text.match(/https?:\/\/[^\s"'<>()]+(?:\([^\s"'<>]+\)|[^\s`!@#$%^&*()_=+\[\]{};:'",.<>?])/i);
  return match ? match[0] : "";
}

function fallbackRuleExtractor(
  subject: string,
  sender: string,
  body: string,
  profile: StudentProfile
): ExtractedOpportunity {
  const lower = `${subject} ${body}`.toLowerCase();
  
  // 1. Detect Category
  let category = "Campus Event";
  if (/hackathon|hackmit|hackath|coding challenge|ideathon|game jam/i.test(lower)) {
    category = "Hackathon";
  } else if (/internship|intern |co-op|summer 202|swe intern|analyst intern/i.test(lower)) {
    category = "Internship";
  } else if (/scholarship|fellowship|grant|tuition award|stipend award/i.test(lower)) {
    category = "Scholarship";
  } else if (/research|lab |reu |phd |undergraduate researcher|faculty lab|paper submission/i.test(lower)) {
    category = "Research";
  } else if (/workshop|bootcamp|hands-on|tech talk|seminar|training session|masterclass/i.test(lower)) {
    category = "Workshop";
  } else if (/homework|assignment|gradescope|canvas|exam|midterm|quiz|due date|course drop|registrar/i.test(lower)) {
    category = "Academic Deadline";
  }

  // 2. Extract Organization
  let organization = sender.replace(/<.*?>/, "").trim();
  const orgMatch = body.match(/(?:at|with|by|from)\s+([A-Z][A-Za-z0-9&.\s]{2,25}(?:LLC|Inc|Foundation|University|Lab|Technologies|Club|Chapter))/);
  if (orgMatch && orgMatch[1]) {
    organization = orgMatch[1].trim();
  } else if (/google/i.test(lower)) {
    organization = "Google";
  } else if (/mit/i.test(lower)) {
    organization = "MIT";
  } else if (/jane street/i.test(lower)) {
    organization = "Jane Street";
  } else if (/anitab/i.test(lower)) {
    organization = "AnitaB.org";
  } else if (/acm/i.test(lower)) {
    organization = "ACM Chapter";
  }

  // 3. Extract Links
  const registrationUrl = extractFirstUrl(body);

  // 4. Extract Deadline
  let deadlineText = "Within 7 Days";
  let deadlineIso: string | null = null;
  const dateMatch = body.match(/(?:deadline|due|by|before|date:?)\s*([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?,? \d{4}(?: at \d{1,2}(?::\d{2})?\s*(?:am|pm|est|pst|utc)?)?)/i);
  if (dateMatch && dateMatch[1]) {
    deadlineText = dateMatch[1];
  }

  // 5. Calculate Urgency Score
  let urgency = 65;
  if (/urgent|reminder|extension|today|tomorrow|last day|final notice/i.test(lower)) {
    urgency = 92;
  } else if (/october 1[678]|oct 1[678]/i.test(lower)) {
    urgency = 95;
  } else if (/october 2[0-4]|oct 2[0-4]/i.test(lower)) {
    urgency = 85;
  } else if (/november|nov /i.test(lower)) {
    urgency = 68;
  }

  // 6. Calculate Student Profile Match Score
  let match = 70;
  const skills = (profile.skills || "python, ml, web dev").toLowerCase().split(/,\s*/);
  const interests = (profile.interests || "ai, hackathons, cloud").toLowerCase().split(/,\s*/);
  const dept = (profile.department || "computer science").toLowerCase();

  for (const skill of skills) {
    if (skill && lower.includes(skill)) match += 7;
  }
  for (const interest of interests) {
    if (interest && lower.includes(interest)) match += 8;
  }
  if (lower.includes(dept) || lower.includes("computer science") || lower.includes("engineering")) {
    match += 10;
  }
  match = Math.min(99, Math.max(55, match));

  // 7. Actions Checklist
  const actions: string[] = [];
  if (registrationUrl) {
    actions.push(`Complete online application at ${registrationUrl.slice(0, 35)}...`);
  }
  if (/resume|cv/i.test(lower)) {
    actions.push("Update and upload 1-page PDF resume");
  }
  if (/transcript/i.test(lower)) {
    actions.push("Attach recent college transcript");
  }
  if (/recommendation|letter of rec/i.test(lower)) {
    actions.push("Request faculty letters of recommendation");
  }
  if (/rsvp|register/i.test(lower) && actions.length < 2) {
    actions.push("RSVP to reserve your seat/spot");
  }
  if (actions.length === 0) {
    actions.push("Review guidelines and submit before the stated deadline");
  }

  // Summary
  const firstSentence = body.split(/[.\n]/).filter(s => s.trim().length > 20)[0] || subject;
  const summary = firstSentence.trim().slice(0, 160) + "...";

  return {
    title: subject.replace(/^(fwd:|re:|\s*\[.*?\])\s*/gi, "").trim(),
    category,
    organization,
    summary,
    deadlineText,
    deadlineIso,
    eligibility: /gpa \d\.\d/i.test(lower) ? "Min GPA requirement, enrolled student" : "Open to all undergraduate & graduate students",
    academicYears: /senior|graduate/i.test(lower) ? "3rd, 4th Year, Masters" : "All Academic Years",
    branches: "Computer Science, Electrical, Data Science & related",
    registrationUrl,
    requiredActions: actions,
    urgencyScore: urgency,
    matchScore: match
  };
}
