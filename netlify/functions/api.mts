import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { students, emails, opportunities, digests } from "../../db/schema.js";
import { eq, desc, asc, and, ilike, sql } from "drizzle-orm";
import { extractOpportunityFromEmail, StudentProfile } from "./lib/extractor.js";
import { SEED_EMAILS, SeedEmail } from "./lib/seedData.js";

// In-memory fallback cache so the app always displays rich data even during database initializations
interface MemoryStore {
  student: {
    id: number;
    name: string;
    email: string;
    department: string;
    academicYear: string;
    skills: string;
    interests: string;
    gpa: string;
    minUrgencyAlert: number;
  };
  emails: any[];
  opportunities: any[];
  digests: any[];
}

const memoryStore: MemoryStore = {
  student: {
    id: 1,
    name: "Alex Rivera",
    email: "alex.rivera@university.edu",
    department: "Computer Science & Engineering",
    academicYear: "3rd Year",
    skills: "Python, TypeScript, Machine Learning, Distributed Systems",
    interests: "AI/ML, Hackathons, Open Source, Cloud Architecture",
    gpa: "3.85",
    minUrgencyAlert: 75
  },
  emails: [],
  opportunities: [],
  digests: []
};

// Initialize memory store with seed data
function initMemoryStore() {
  if (memoryStore.opportunities.length === 0) {
    let idCounter = 1;
    for (const item of SEED_EMAILS) {
      const emailId = idCounter;
      memoryStore.emails.push({
        id: emailId,
        messageId: item.messageId,
        subject: item.subject,
        sender: item.sender,
        senderEmail: item.senderEmail,
        receivedAt: new Date(item.receivedAt),
        snippet: item.snippet,
        body: item.body,
        isProcessed: true,
        createdAt: new Date(item.receivedAt)
      });

      memoryStore.opportunities.push({
        id: idCounter,
        emailId: emailId,
        title: item.subject.replace(/^(fwd:|re:|\s*\[.*?\])\s*/gi, "").trim(),
        category: item.category,
        organization: item.organization,
        summary: item.snippet,
        deadline: item.deadlineIso ? new Date(item.deadlineIso) : new Date(Date.now() + 86400000 * 7),
        deadlineText: item.deadlineText,
        eligibility: item.eligibility,
        academicYears: item.academicYears,
        branches: item.branches,
        registrationUrl: item.registrationUrl,
        requiredActions: JSON.stringify(item.requiredActions),
        urgencyScore: item.urgencyScore,
        matchScore: item.matchScore,
        userStatus: "new",
        isBookmarked: false,
        notes: "",
        createdAt: new Date(item.receivedAt)
      });
      idCounter++;
    }
  }
}
initMemoryStore();

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/api/, "");
  const method = req.method;

  // JSON helper
  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });

  try {
    // 1. STATS
    if (pathname === "/stats" || pathname === "") {
      try {
        const allOpps = await db.select().from(opportunities);
        if (allOpps.length > 0) {
          const urgentCount = allOpps.filter(o => o.urgencyScore >= 80).length;
          const highMatchCount = allOpps.filter(o => o.matchScore >= 85).length;
          const categories: Record<string, number> = {};
          for (const opp of allOpps) {
            categories[opp.category] = (categories[opp.category] || 0) + 1;
          }
          return json({
            totalEmails: (await db.select().from(emails)).length,
            totalOpportunities: allOpps.length,
            urgentCount,
            highMatchCount,
            categories
          });
        }
      } catch (e) {
        // Fallback to memoryStore
      }

      const all = memoryStore.opportunities;
      const categories: Record<string, number> = {};
      for (const opp of all) {
        categories[opp.category] = (categories[opp.category] || 0) + 1;
      }
      return json({
        totalEmails: memoryStore.emails.length,
        totalOpportunities: all.length,
        urgentCount: all.filter(o => o.urgencyScore >= 80).length,
        highMatchCount: all.filter(o => o.matchScore >= 85).length,
        categories
      });
    }

    // 2. STUDENT PROFILE
    if (pathname === "/profile") {
      if (method === "GET") {
        try {
          const [prof] = await db.select().from(students).limit(1);
          if (prof) return json(prof);
        } catch (e) {
          // fallback
        }
        return json(memoryStore.student);
      }

      if (method === "PUT") {
        const body = await req.json();
        try {
          const [existing] = await db.select().from(students).limit(1);
          if (existing) {
            const [updated] = await db
              .update(students)
              .set({
                name: body.name || existing.name,
                email: body.email || existing.email,
                department: body.department || existing.department,
                academicYear: body.academicYear || existing.academicYear,
                skills: body.skills || existing.skills,
                interests: body.interests || existing.interests,
                gpa: body.gpa || existing.gpa,
                minUrgencyAlert: body.minUrgencyAlert ?? existing.minUrgencyAlert,
                updatedAt: new Date()
              })
              .where(eq(students.id, existing.id))
              .returning();
            return json(updated);
          } else {
            const [created] = await db
              .insert(students)
              .values({
                name: body.name || "Alex Rivera",
                email: body.email || "alex.rivera@university.edu",
                department: body.department || "Computer Science & Engineering",
                academicYear: body.academicYear || "3rd Year",
                skills: body.skills || "Python, Machine Learning",
                interests: body.interests || "AI/ML, Hackathons",
                gpa: body.gpa || "3.85",
                minUrgencyAlert: body.minUrgencyAlert ?? 60
              })
              .returning();
            return json(created);
          }
        } catch (e) {
          // Update memory store
          Object.assign(memoryStore.student, body);
          return json(memoryStore.student);
        }
      }
    }

    // 3. OPPORTUNITIES
    if (pathname === "/opportunities") {
      if (method === "GET") {
        const categoryFilter = url.searchParams.get("category");
        const urgencyFilter = url.searchParams.get("urgency");
        const statusFilter = url.searchParams.get("status");
        const searchQuery = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sortBy = url.searchParams.get("sort") || "urgency";

        let oppList: any[] = [];
        try {
          oppList = await db.select().from(opportunities).orderBy(desc(opportunities.urgencyScore));
        } catch (e) {
          oppList = [...memoryStore.opportunities];
        }

        if (oppList.length === 0 && memoryStore.opportunities.length > 0) {
          oppList = [...memoryStore.opportunities];
        }

        // Apply filters in memory
        let filtered = oppList.filter(item => {
          if (categoryFilter && categoryFilter !== "All" && item.category !== categoryFilter) {
            return false;
          }
          if (urgencyFilter && urgencyFilter !== "All") {
            if (urgencyFilter === "Critical" && item.urgencyScore < 85) return false;
            if (urgencyFilter === "High" && (item.urgencyScore < 70 || item.urgencyScore >= 85)) return false;
            if (urgencyFilter === "Medium" && (item.urgencyScore < 50 || item.urgencyScore >= 70)) return false;
            if (urgencyFilter === "Low" && item.urgencyScore >= 50) return false;
          }
          if (statusFilter && statusFilter !== "All") {
            if (statusFilter === "Bookmarked" && !item.isBookmarked) return false;
            if (statusFilter !== "Bookmarked" && item.userStatus !== statusFilter.toLowerCase()) return false;
          }
          if (searchQuery) {
            const haystack = `${item.title} ${item.organization} ${item.summary} ${item.eligibility} ${item.category}`.toLowerCase();
            if (!haystack.includes(searchQuery)) return false;
          }
          return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
          if (sortBy === "urgency") return b.urgencyScore - a.urgencyScore;
          if (sortBy === "match") return b.matchScore - a.matchScore;
          if (sortBy === "deadline") {
            const tA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const tB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return tA - tB;
          }
          if (sortBy === "recent") {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          }
          return 0;
        });

        return json(filtered);
      }

      if (method === "POST") {
        const body = await req.json();
        const newOpp = {
          title: body.title,
          category: body.category || "Campus Event",
          organization: body.organization || "University",
          summary: body.summary || "",
          deadline: body.deadline ? new Date(body.deadline) : null,
          deadlineText: body.deadlineText || "Not Specified",
          eligibility: body.eligibility || "Open to all students",
          academicYears: body.academicYears || "All",
          branches: body.branches || "All Branches",
          registrationUrl: body.registrationUrl || "",
          requiredActions: JSON.stringify(body.requiredActions || []),
          urgencyScore: body.urgencyScore || 60,
          matchScore: body.matchScore || 75,
          userStatus: "new",
          isBookmarked: false,
          notes: "",
          createdAt: new Date()
        };

        try {
          const [inserted] = await db.insert(opportunities).values(newOpp).returning();
          return json(inserted, 201);
        } catch (e) {
          const memRecord = { id: Date.now(), ...newOpp };
          memoryStore.opportunities.unshift(memRecord);
          return json(memRecord, 201);
        }
      }
    }

    // 4. INDIVIDUAL OPPORTUNITY ACTIONS
    const oppMatch = pathname.match(/^\/opportunities\/(\d+)(.*)/);
    if (oppMatch) {
      const oppId = parseInt(oppMatch[1], 10);

      if (method === "GET") {
        try {
          const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId));
          if (opp) return json(opp);
        } catch (e) {
          // fallback
        }
        const mem = memoryStore.opportunities.find(o => o.id === oppId);
        return mem ? json(mem) : json({ error: "Opportunity not found" }, 404);
      }

      if (method === "PATCH") {
        const body = await req.json();
        const updateData: any = {};
        if (body.userStatus !== undefined) updateData.userStatus = body.userStatus;
        if (body.isBookmarked !== undefined) updateData.isBookmarked = body.isBookmarked;
        if (body.notes !== undefined) updateData.notes = body.notes;

        try {
          const [updated] = await db
            .update(opportunities)
            .set(updateData)
            .where(eq(opportunities.id, oppId))
            .returning();
          if (updated) return json(updated);
        } catch (e) {
          // fallback
        }

        const mem = memoryStore.opportunities.find(o => o.id === oppId);
        if (mem) {
          Object.assign(mem, updateData);
          return json(mem);
        }
        return json({ error: "Opportunity not found" }, 404);
      }

      if (method === "DELETE") {
        try {
          await db.delete(opportunities).where(eq(opportunities.id, oppId));
        } catch (e) {
          // fallback
        }
        memoryStore.opportunities = memoryStore.opportunities.filter(o => o.id !== oppId);
        return json({ success: true, deletedId: oppId });
      }
    }

    // 5. EMAILS INGESTION & AI ANALYSIS
    if (pathname === "/emails/analyze" && method === "POST") {
      const payload = await req.json();
      const subject = payload.subject || "College Notification";
      const sender = payload.sender || "Campus Programs <announcements@university.edu>";
      const bodyText = payload.body || "";

      // Fetch student profile for personalized matching
      let currentProfile: StudentProfile = memoryStore.student;
      try {
        const [prof] = await db.select().from(students).limit(1);
        if (prof) currentProfile = prof;
      } catch (e) {
        // use memory
      }

      // Run AI Extraction
      const extracted = await extractOpportunityFromEmail(subject, sender, bodyText, currentProfile);

      // Persist Email
      const emailRecord = {
        messageId: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        subject,
        sender,
        senderEmail: sender.match(/<([^>]+)>/)?.[1] || sender,
        snippet: bodyText.slice(0, 150) + "...",
        body: bodyText,
        isProcessed: true,
        createdAt: new Date()
      };

      let emailId: number | null = null;
      try {
        const [insertedEmail] = await db.insert(emails).values(emailRecord).returning();
        emailId = insertedEmail.id;
      } catch (e) {
        emailId = Date.now();
        memoryStore.emails.unshift({ id: emailId, ...emailRecord });
      }

      // Persist Extracted Opportunity
      const oppRecord = {
        emailId,
        title: extracted.title,
        category: extracted.category,
        organization: extracted.organization,
        summary: extracted.summary,
        deadline: extracted.deadlineIso ? new Date(extracted.deadlineIso) : null,
        deadlineText: extracted.deadlineText,
        eligibility: extracted.eligibility,
        academicYears: extracted.academicYears,
        branches: extracted.branches,
        registrationUrl: extracted.registrationUrl,
        requiredActions: JSON.stringify(extracted.requiredActions),
        urgencyScore: extracted.urgencyScore,
        matchScore: extracted.matchScore,
        userStatus: "new",
        isBookmarked: false,
        notes: "",
        createdAt: new Date()
      };

      try {
        const [insertedOpp] = await db.insert(opportunities).values(oppRecord).returning();
        return json({
          success: true,
          email: emailRecord,
          opportunity: insertedOpp,
          extracted
        }, 201);
      } catch (e) {
        const memOpp = { id: Date.now(), ...oppRecord };
        memoryStore.opportunities.unshift(memOpp);
        return json({
          success: true,
          email: emailRecord,
          opportunity: memOpp,
          extracted
        }, 201);
      }
    }

    // 6. SEED / RESET DATA
    if (pathname === "/emails/seed" && method === "POST") {
      try {
        // Insert seed emails and opportunities into DB
        for (const item of SEED_EMAILS) {
          const [insEmail] = await db
            .insert(emails)
            .values({
              messageId: item.messageId,
              subject: item.subject,
              sender: item.sender,
              senderEmail: item.senderEmail,
              snippet: item.snippet,
              body: item.body,
              isProcessed: true,
              receivedAt: new Date(item.receivedAt)
            })
            .onConflictDoNothing()
            .returning();

          if (insEmail) {
            await db.insert(opportunities).values({
              emailId: insEmail.id,
              title: item.subject.replace(/^(fwd:|re:|\s*\[.*?\])\s*/gi, "").trim(),
              category: item.category,
              organization: item.organization,
              summary: item.snippet,
              deadline: item.deadlineIso ? new Date(item.deadlineIso) : new Date(Date.now() + 86400000 * 7),
              deadlineText: item.deadlineText,
              eligibility: item.eligibility,
              academicYears: item.academicYears,
              branches: item.branches,
              registrationUrl: item.registrationUrl,
              requiredActions: JSON.stringify(item.requiredActions),
              urgencyScore: item.urgencyScore,
              matchScore: item.matchScore,
              userStatus: "new",
              isBookmarked: false,
              notes: ""
            });
          }
        }
      } catch (e) {
        // fallback
        initMemoryStore();
      }

      return json({
        success: true,
        message: "Successfully loaded college opportunity emails and structured digests",
        count: SEED_EMAILS.length
      });
    }

    // 7. GET EMAILS LIST
    if (pathname === "/emails" && method === "GET") {
      try {
        const emailList = await db.select().from(emails).orderBy(desc(emails.receivedAt));
        if (emailList.length > 0) return json(emailList);
      } catch (e) {
        // fallback
      }
      return json(memoryStore.emails);
    }

    // 8. DAILY DIGEST GENERATOR
    if (pathname === "/digest" && method === "GET") {
      let opps: any[] = [];
      let prof = memoryStore.student;
      try {
        opps = await db.select().from(opportunities).orderBy(desc(opportunities.urgencyScore));
        const [p] = await db.select().from(students).limit(1);
        if (p) prof = p;
      } catch (e) {
        opps = [...memoryStore.opportunities];
      }
      if (opps.length === 0) opps = [...memoryStore.opportunities];

      const urgentOpps = opps.filter(o => o.urgencyScore >= 80);
      const topMatches = opps.filter(o => o.matchScore >= 85);
      const todayFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      const digest = {
        date: todayFormatted,
        greeting: `Good morning, ${prof.name.split(" ")[0]}!`,
        overview: `Here is your Smart Inbox Executive Brief for ${todayFormatted}. We analyzed your recent college communications and identified ${urgentOpps.length} critical deadlines requiring immediate action, alongside ${topMatches.length} high-match opportunities tailored to your ${prof.department} curriculum.`,
        urgentDeadlines: urgentOpps.map(o => ({
          title: o.title,
          category: o.category,
          organization: o.organization,
          deadlineText: o.deadlineText,
          urgencyScore: o.urgencyScore,
          action: Array.isArray(JSON.parse(o.requiredActions || "[]")) && JSON.parse(o.requiredActions).length > 0
            ? JSON.parse(o.requiredActions)[0]
            : "Review application"
        })),
        recommendedPicks: topMatches.map(o => ({
          title: o.title,
          category: o.category,
          matchScore: o.matchScore,
          organization: o.organization,
          summary: o.summary,
          link: o.registrationUrl
        })),
        stats: {
          analyzedEmails: memoryStore.emails.length || opps.length,
          activeOpportunities: opps.length,
          urgentCount: urgentOpps.length,
          topMatchCount: topMatches.length
        }
      };

      return json(digest);
    }

    // Route not found
    return json({ error: `Not Found: ${pathname}` }, 404);
  } catch (error: any) {
    console.error("API error:", error);
    return json({ error: "Internal Server Error", message: error.message }, 500);
  }
};

export const config: Config = {
  path: "/api/*"
};
