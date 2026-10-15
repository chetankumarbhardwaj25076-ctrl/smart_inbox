export interface SeedEmail {
  messageId: string;
  subject: string;
  sender: string;
  senderEmail: string;
  snippet: string;
  body: string;
  receivedAt: string;
  category: string;
  organization: string;
  deadlineText: string;
  deadlineIso: string;
  eligibility: string;
  academicYears: string;
  branches: string;
  registrationUrl: string;
  requiredActions: string[];
  urgencyScore: number;
  matchScore: number;
}

export const SEED_EMAILS: SeedEmail[] = [
  {
    messageId: "mit-hack-2026",
    subject: "HackMIT 2026 Applications Now Open! ⚡ $65,000 in Prizes & Travel Grants",
    sender: "HackMIT Organizing Team",
    senderEmail: "team@hackmit.org",
    snippet: "Join 1,200+ hackers for 36 hours of building at MIT campus in Boston or virtually. Travel reimbursement available.",
    body: `Hey Hackers!

HackMIT 2026 is officially accepting applications! Whether you are a beginner building your first project or an experienced hacker working with generative AI, web3, or hardware, we welcome all collegiate undergraduate and graduate students.

Event Details:
- Dates: November 14-16, 2026
- Location: Cambridge, MA (Travel grants available for US & Canadian students)
- Tracks: AI Agents, Sustainable Tech, HealthTech, FinTech & Open Innovation
- Over $65,000 in prizes, top tech mentors, and direct recruiter interviews.

Eligibility: Open to all undergraduate and masters students worldwide.
Application Deadline: October 26, 2026 at 11:59 PM EST.

Required Steps:
1. Complete hacker profile at https://hackmit.org/apply
2. Submit your GitHub / Portfolio link
3. RSVP within 48 hours of acceptance email

Don't wait until the last minute—spots fill on a rolling review basis!`,
    receivedAt: "2026-10-15T08:15:00Z",
    category: "Hackathon",
    organization: "MIT Hackathon Team",
    deadlineText: "Oct 26, 2026, 11:59 PM EST",
    deadlineIso: "2026-10-26T23:59:00Z",
    eligibility: "All undergraduate & graduate students in CS, Engineering, or related fields",
    academicYears: "1st, 2nd, 3rd, 4th Year, Masters",
    branches: "Computer Science, Electrical, Data Science, Math",
    registrationUrl: "https://hackmit.org/apply",
    requiredActions: [
      "Submit online application form with GitHub link",
      "Attach resume for sponsor review",
      "Request travel reimbursement if traveling > 100 miles"
    ],
    urgencyScore: 82,
    matchScore: 96
  },
  {
    messageId: "google-swe-2027",
    subject: "Google Summer 2027 Software Engineering Internship - Priority University Application",
    sender: "Google University Programs",
    senderEmail: "internships@google.com",
    snippet: "Early consideration window is now open for University students graduating between Dec 2027 and Summer 2028.",
    body: `Hello Future Googler,

Applications for the Google 2027 Software Engineering Internship cohort are now live for priority campus partners.

About the Internship:
Work alongside Google engineers solving high-impact problems across Search, Cloud, Gemini/AI infrastructure, Chrome, and Android.
- 12-14 week paid internship in Mountain View, New York, Seattle, or Austin
- Comprehensive housing stipend and relocation assistance
- Competitive hourly compensation + 1:1 mentorship

Eligibility Requirements:
- Currently enrolled in an accredited BS or MS degree program in Computer Science, Software Engineering, or related technical field
- Graduating between December 2027 and August 2028
- Proficient in Python, C++, Java, or Go

Priority Application Deadline: October 24, 2026 (firm deadline for batch 1 interview invites)

Required Actions:
1. Update and upload a 1-page PDF resume
2. Fill the application at https://careers.google.com/students/swe-intern-2027
3. Complete the 60-minute Google Online Coding Assessment within 5 days of submission`,
    receivedAt: "2026-10-14T14:30:00Z",
    category: "Internship",
    organization: "Google LLC",
    deadlineText: "Oct 24, 2026, 11:59 PM PST",
    deadlineIso: "2026-10-24T23:59:00Z",
    eligibility: "BS / MS in CS, EE, or related; Graduating Dec 2027 - Aug 2028; Min 3.0 GPA",
    academicYears: "2nd Year, 3rd Year",
    branches: "Computer Science & Engineering, Information Science, Software Engineering",
    registrationUrl: "https://careers.google.com/students/swe-intern-2027",
    requiredActions: [
      "Upload 1-page resume highlighting projects and coding languages",
      "Submit official or unofficial college transcript",
      "Complete online OA assessment upon invitation"
    ],
    urgencyScore: 92,
    matchScore: 98
  },
  {
    messageId: "cs401-deadline-ext",
    subject: "URGENT: CS 401 Distributed Systems - Homework 3 & Raft Lab Deadline Reminder",
    sender: "Prof. David Karger (CS Dept)",
    senderEmail: "karger@university.edu",
    snippet: "Reminder that Homework 3 and the Raft consensus implementation is due this Friday at 11:59 PM. No late days allowed.",
    body: `Class,

This is a reminder that CS 401 Homework 3 (Raft Leader Election and Log Replication) must be submitted via Gradescope no later than Friday, October 17, 2026 at 11:59 PM.

Please note:
- Per course policy, late days CANNOT be used on Lab 3 because solutions will be discussed in Monday's lecture.
- Ensure your test suite passes all 20 concurrency test cases before tagging git commit.
- Office hours are held today 3:00 - 6:00 PM in Gates Hall 320 for debugging help.

Submission Link: https://gradescope.com/courses/cs401/assignments/hw3

Best,
Prof. Karger & Course Staff`,
    receivedAt: "2026-10-15T09:00:00Z",
    category: "Academic Deadline",
    organization: "Dept of Computer Science",
    deadlineText: "Oct 17, 2026, 11:59 PM",
    deadlineIso: "2026-10-17T23:59:00Z",
    eligibility: "Students enrolled in CS 401: Distributed Systems",
    academicYears: "3rd Year, 4th Year",
    branches: "Computer Science, Computer Engineering",
    registrationUrl: "https://gradescope.com/courses/cs401/assignments/hw3",
    requiredActions: [
      "Pass all 20 unit tests in raft_test.go",
      "Push final code to course GitHub repository",
      "Submit repo commit hash to Gradescope before Friday 11:59 PM"
    ],
    urgencyScore: 98,
    matchScore: 90
  },
  {
    messageId: "nsf-ai-research-2026",
    subject: "NSF REU Fellowship in Deep Learning & Autonomous Systems - $8,000 Stipend + Housing",
    sender: "National Science Foundation & University AI Lab",
    senderEmail: "reu-admissions@ailab.edu",
    snippet: "Summer research opportunity working with faculty on multimodal foundation models and edge AI.",
    body: `Dear Undergraduate Researchers,

The National Science Foundation Research Experiences for Undergraduates (NSF REU) program is inviting applications for the 2027 Summer Research Cohort.

Program Highlights:
- 10-week intensive research under top faculty in AI, robotics, and reinforcement learning
- $8,000 research stipend plus complimentary campus housing and meal allowance
- Travel support to present findings at NeurIPS, ICML, or CVPR
- Potential co-authorship on peer-reviewed papers

Eligibility:
- US Citizens or Permanent Residents enrolled as undergraduates (Sophomores, Juniors, or Seniors graduating after Summer 2027)
- Minimum cumulative GPA of 3.3
- Background in linear algebra, multivariable calculus, and Python/PyTorch

Application Deadline: November 05, 2026 at 5:00 PM EST.

Required Documents:
- Unofficial transcripts
- 2-page Statement of Purpose describing research interests
- 2 Faculty Letters of Recommendation

Apply at: https://ailab.edu/nsf-reu-apply`,
    receivedAt: "2026-10-13T11:20:00Z",
    category: "Research",
    organization: "National Science Foundation (NSF)",
    deadlineText: "Nov 05, 2026, 5:00 PM EST",
    deadlineIso: "2026-11-05T17:00:00Z",
    eligibility: "Undergraduates with 3.3+ GPA, US Citizen/PR, background in Python/PyTorch",
    academicYears: "2nd Year, 3rd Year, 4th Year",
    branches: "Computer Science, Electrical, Mathematics, Data Science",
    registrationUrl: "https://ailab.edu/nsf-reu-apply",
    requiredActions: [
      "Write 2-page Statement of Purpose on AI interests",
      "Request 2 faculty recommendation letters",
      "Upload PDF transcript to online portal"
    ],
    urgencyScore: 68,
    matchScore: 94
  },
  {
    messageId: "women-tech-scholarship",
    subject: "AnitaB / Grace Hopper Tech Leaders Scholarship 2026 ($12,000 Award + GHC Pass)",
    sender: "AnitaB.org Foundation",
    senderEmail: "scholarships@anitab.org",
    snippet: "Annual merit scholarship providing tuition support and full registration + travel to Grace Hopper Celebration.",
    body: `Dear Scholar,

Applications are now open for the 2026 Tech Leaders Diversity Scholarship. 

Awards:
- $12,000 direct tuition grant for the 2026-2027 academic year
- All-expenses-paid trip and VIP pass to the Grace Hopper Celebration in Chicago
- 1-year executive mentorship with tech industry leaders

Eligibility:
- Female, non-binary, or underrepresented undergraduate or graduate students in computing and engineering disciplines
- Minimum 3.2 cumulative GPA
- Demonstrated passion for technology and campus community leadership

Deadline: October 30, 2026 at 11:59 PM.

Link: https://anitab.org/scholarships/tech-leaders-2026`,
    receivedAt: "2026-10-12T16:45:00Z",
    category: "Scholarship",
    organization: "AnitaB.org",
    deadlineText: "Oct 30, 2026, 11:59 PM",
    deadlineIso: "2026-10-30T23:59:00Z",
    eligibility: "Undergrad / Grad students in tech disciplines with min 3.2 GPA",
    academicYears: "All",
    branches: "Computer Science, Engineering, Information Systems",
    registrationUrl: "https://anitab.org/scholarships/tech-leaders-2026",
    requiredActions: [
      "Submit short essay on diversity in technology",
      "Provide academic transcript",
      "List community leadership and extracurricular involvement"
    ],
    urgencyScore: 74,
    matchScore: 88
  },
  {
    messageId: "workshop-llm-fine-tuning",
    subject: "Hands-on Workshop: Fine-Tuning Open Source LLMs with LoRA & vLLM",
    sender: "ACM Student Chapter & AI Club",
    senderEmail: "acm-events@university.edu",
    snippet: "Build your own specialized coding assistant in a 3-hour code-along workshop. Free cloud GPU credits provided.",
    body: `Hi Builders!

Ready to go beyond prompt engineering? Join the ACM & AI Club this Saturday for a live, project-based technical workshop:

"Deploying and Fine-Tuning Llama 3 and Mistral with LoRA, Unsloth, and vLLM"

Workshop Highlights:
- Setting up training pipelines with Hugging Face and PyTorch
- Parameter-Efficient Fine-Tuning (PEFT / LoRA) on custom datasets
- Serving quantized models with vLLM with <15ms latency
- $50 in free RunPod / Lambda GPU credits for each registered attendee!

When: Saturday, October 18, 2026, 1:00 PM – 4:30 PM
Where: Turing Auditorium (Room 101) + Zoom Live Stream
RSVP Required (Capacity capped at 90 participants for GPU vouchers)

Register: https://acm.university.edu/workshops/llm-finetuning`,
    receivedAt: "2026-10-15T07:10:00Z",
    category: "Workshop",
    organization: "ACM & University AI Club",
    deadlineText: "Oct 18, 2026, 1:00 PM",
    deadlineIso: "2026-10-18T13:00:00Z",
    eligibility: "Open to all university students with basic Python knowledge",
    academicYears: "All",
    branches: "Computer Science, Data Science, Electrical, Math",
    registrationUrl: "https://acm.university.edu/workshops/llm-finetuning",
    requiredActions: [
      "RSVP on the ACM portal to claim GPU credits voucher",
      "Pre-install Python 3.11 and Git before the session",
      "Bring laptop and charger"
    ],
    urgencyScore: 94,
    matchScore: 95
  },
  {
    messageId: "campus-career-fair-2026",
    subject: "Fall 2026 STEM Career Fair: 140+ Companies Registering Students",
    sender: "University Career Services Center",
    senderEmail: "careers@university.edu",
    snippet: "Top employers including Microsoft, Apple, Bloomberg, Nvidia, Palantir, and Lockheed Martin recruiting on campus.",
    body: `Students,

The Annual Fall STEM Career Fair is happening next Wednesday!

Event Details:
- Date: Wednesday, October 21, 2026 (10:00 AM - 4:00 PM)
- Venue: University Sports Complex Arena
- Participating Employers: 140+ top tech, robotics, consulting, and defense employers
- Opportunities: Full-time SWE, hardware engineering, data science, and summer internships

Preparation Tips:
- Upload your updated resume to Handshake by Monday, Oct 19 for the digital resume book distributed to all employers
- Business casual or professional attire required
- Download the Career Fair Plus app for interactive booth maps

Student Pre-Registration: https://university.joinhandshake.com/career_fairs/fall2026`,
    receivedAt: "2026-10-14T10:00:00Z",
    category: "Campus Event",
    organization: "University Career Services",
    deadlineText: "Oct 19, 2026 (Resume Book)",
    deadlineIso: "2026-10-19T23:59:00Z",
    eligibility: "All currently enrolled students & recent alumni",
    academicYears: "All",
    branches: "All Engineering & Science Majors",
    registrationUrl: "https://university.joinhandshake.com/career_fairs/fall2026",
    requiredActions: [
      "Upload resume to Handshake for employer preview",
      "Review list of 140+ participating companies and prepare elevator pitch",
      "Print 10-15 copies of resume"
    ],
    urgencyScore: 86,
    matchScore: 92
  },
  {
    messageId: "jane-street-etc-2026",
    subject: "Jane Street Electronic Trading Challenge (Collegiate Bowl) - $20,000 Prizes",
    sender: "Jane Street University Recruiting",
    senderEmail: "etc-recruiting@janestreet.com",
    snippet: "Build an algorithmic trading bot in a simulated market environment. Teams of 2 to 4 students.",
    body: `Hello Problem Solvers,

Jane Street is excited to announce the Collegiate Electronic Trading Challenge (ETC)!

ETC is an intensive day-long competition where teams build automated trading bots to interact on our simulated electronic exchange. You will write algorithms to handle market making, arbitrage, and risk management in real time.

What we offer:
- $20,000 prize pool for top-performing university teams
- Fast-track interview invitations for quantitative trading and quantitative research roles
- Lunch, dinner, and exclusive Jane Street swag provided

When: Saturday, November 07, 2026
Where: Jane Street New York Office (travel covered) or Virtual Option

Eligibility: Undergraduate & Master's students passionate about algorithms, math, and high-frequency systems.
Application Deadline: October 27, 2026 at 11:59 PM.

Register: https://www.janestreet.com/join-jane-street/etc-2026`,
    receivedAt: "2026-10-13T18:00:00Z",
    category: "Hackathon",
    organization: "Jane Street",
    deadlineText: "Oct 27, 2026, 11:59 PM",
    deadlineIso: "2026-10-27T23:59:00Z",
    eligibility: "Undergrad & MS students in CS, Math, Physics, or Finance",
    academicYears: "2nd Year, 3rd Year, 4th Year",
    branches: "Computer Science, Mathematics, Electrical, Physics",
    registrationUrl: "https://www.janestreet.com/join-jane-street/etc-2026",
    requiredActions: [
      "Form a team of 2-4 students or apply for random matching",
      "Complete quick 30-minute probability and coding quiz",
      "Confirm attendance upon invitation"
    ],
    urgencyScore: 78,
    matchScore: 89
  },
  {
    messageId: "registrar-drop-deadline",
    subject: "REGISTRAR NOTICE: Fall Term Course Withdrawal / Drop with 'W' Deadline",
    sender: "Office of the University Registrar",
    senderEmail: "registrar@university.edu",
    snippet: "Official academic notice: Last day to drop any fall semester course with a W grade is Friday, October 23, 2026.",
    body: `Official University Notice to All Students:

Please be advised that the deadline to withdraw from a 15-week Fall 2026 course and receive a grade of 'W' (Withdrawal) is:

Friday, October 23, 2026 at 5:00 PM EST.

Important Guidelines:
- After this date and time, no course withdrawals are permitted without formal petition and medical or dean's exception.
- Dropping below full-time status (minimum 12 credit units) may affect financial aid, visa status for international students, and campus housing eligibility.
- Consult your academic advisor before submitting the drop request.

Form and Instructions: https://portal.university.edu/registrar/forms/course-drop`,
    receivedAt: "2026-10-15T06:30:00Z",
    category: "Academic Deadline",
    organization: "University Registrar",
    deadlineText: "Oct 23, 2026, 5:00 PM EST",
    deadlineIso: "2026-10-23T17:00:00Z",
    eligibility: "All enrolled undergraduate and graduate students",
    academicYears: "All",
    branches: "All Departments",
    registrationUrl: "https://portal.university.edu/registrar/forms/course-drop",
    requiredActions: [
      "Review current grades and course load",
      "Schedule emergency advising appointment if below 12 credits",
      "Submit electronic withdrawal form in portal before 5:00 PM"
    ],
    urgencyScore: 88,
    matchScore: 85
  }
];
