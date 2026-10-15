CREATE TABLE "digests" (
	"id" serial PRIMARY KEY,
	"digest_date" text NOT NULL,
	"title" text NOT NULL,
	"summary_html" text NOT NULL,
	"urgent_count" integer DEFAULT 0 NOT NULL,
	"opportunity_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" serial PRIMARY KEY,
	"message_id" text NOT NULL UNIQUE,
	"subject" text NOT NULL,
	"sender" text NOT NULL,
	"sender_email" text NOT NULL,
	"received_at" timestamp DEFAULT now(),
	"snippet" text NOT NULL,
	"body" text NOT NULL,
	"is_processed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY,
	"email_id" integer,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"organization" text NOT NULL,
	"summary" text NOT NULL,
	"deadline" timestamp,
	"deadline_text" text,
	"eligibility" text DEFAULT 'Open to all students' NOT NULL,
	"academic_years" text DEFAULT 'All' NOT NULL,
	"branches" text DEFAULT 'All Branches' NOT NULL,
	"registration_url" text,
	"required_actions" text DEFAULT '' NOT NULL,
	"urgency_score" integer DEFAULT 50 NOT NULL,
	"match_score" integer DEFAULT 75 NOT NULL,
	"user_status" text DEFAULT 'new' NOT NULL,
	"is_bookmarked" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"name" text DEFAULT 'Alex Rivera' NOT NULL,
	"email" text DEFAULT 'alex.rivera@university.edu' NOT NULL,
	"department" text DEFAULT 'Computer Science & Engineering' NOT NULL,
	"academic_year" text DEFAULT '3rd Year' NOT NULL,
	"skills" text DEFAULT 'Python, TypeScript, Machine Learning, Web Dev' NOT NULL,
	"interests" text DEFAULT 'AI/ML, Hackathons, Open Source, Cloud, Research' NOT NULL,
	"gpa" text DEFAULT '3.85' NOT NULL,
	"min_urgency_alert" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_email_id_emails_id_fkey" FOREIGN KEY ("email_id") REFERENCES "emails"("id");