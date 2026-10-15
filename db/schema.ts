import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Alex Rivera"),
  email: text("email").notNull().default("alex.rivera@university.edu"),
  department: text("department").notNull().default("Computer Science & Engineering"),
  academicYear: text("academic_year").notNull().default("3rd Year"),
  skills: text("skills").notNull().default("Python, TypeScript, Machine Learning, Web Dev"),
  interests: text("interests").notNull().default("AI/ML, Hackathons, Open Source, Cloud, Research"),
  gpa: text("gpa").notNull().default("3.85"),
  minUrgencyAlert: integer("min_urgency_alert").notNull().default(60),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  subject: text("subject").notNull(),
  sender: text("sender").notNull(),
  senderEmail: text("sender_email").notNull(),
  receivedAt: timestamp("received_at").defaultNow(),
  snippet: text("snippet").notNull(),
  body: text("body").notNull(),
  isProcessed: boolean("is_processed").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => emails.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  organization: text("organization").notNull(),
  summary: text("summary").notNull(),
  deadline: timestamp("deadline"),
  deadlineText: text("deadline_text"),
  eligibility: text("eligibility").notNull().default("Open to all students"),
  academicYears: text("academic_years").notNull().default("All"),
  branches: text("branches").notNull().default("All Branches"),
  registrationUrl: text("registration_url"),
  requiredActions: text("required_actions").notNull().default(""),
  urgencyScore: integer("urgency_score").notNull().default(50),
  matchScore: integer("match_score").notNull().default(75),
  userStatus: text("user_status").notNull().default("new"), // new, interested, applied, dismissed
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  digestDate: text("digest_date").notNull(),
  title: text("title").notNull(),
  summaryHtml: text("summary_html").notNull(),
  urgentCount: integer("urgent_count").notNull().default(0),
  opportunityCount: integer("opportunity_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
