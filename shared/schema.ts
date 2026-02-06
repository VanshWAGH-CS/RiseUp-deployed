import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/chat";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "ngo", "employer"] }).notNull().default("student"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  bio: text("bio"),
  location: text("location"),
  skills: text("skills").array(), // Array of skill strings
  interests: text("interests").array(), // Array of interest strings
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type", { enum: ["full-time", "part-time", "contract", "internship", "apprenticeship"] }).notNull(),
  skills: text("skills").array(), // Required skills
  salaryRange: text("salary_range"),
  postedBy: integer("posted_by").notNull(), // User ID (employer/ngo)
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  provider: text("provider").notNull(),
  category: text("category").notNull(),
  url: text("url"), // External link
  duration: text("duration"),
  skills: text("skills").array(), // Skills learned
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  applicantId: integer("applicant_id").notNull(), // User ID (student)
  status: text("status", { enum: ["Applied", "Under Review", "Accepted", "Rejected"] }).notNull().default("Applied"),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  personalInfo: jsonb("personal_info").notNull(), // { name, email, phone, location, summary, profileLink }
  education: jsonb("education").notNull(), // array of { school, degree, field, startYear, endYear }
  skills: jsonb("skills").notNull(), // array of strings
  projects: jsonb("projects").notNull(), // array of { title, description, link }
  experience: jsonb("experience").notNull(), // array of { company, role, description, startYear, endYear }
  certifications: jsonb("certifications").notNull(), // array of { name, issuer, year }
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  conversationId: integer("conversation_id"), // Linked chat session
  jobTitle: text("job_title"), // Context for the interview
  transcript: jsonb("transcript"), // Array of {role, content}
  feedback: jsonb("feedback"), // AI feedback
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  postedJobs: many(jobs, { relationName: "postedJobs" }),
  applications: many(applications, { relationName: "applicantApplications" }),
  interviews: many(interviews),
  resume: one(resumes, {
    fields: [users.id],
    references: [resumes.userId],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  employer: one(users, {
    fields: [jobs.postedBy],
    references: [users.id],
    relationName: "postedJobs",
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
    relationName: "applicantApplications",
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, status: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, updatedAt: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true, createdAt: true, transcript: true, feedback: true, score: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

// API Request Types
export type LoginRequest = Pick<InsertUser, "username" | "password">;
export type RegisterRequest = InsertUser;
export type UpdateProfileRequest = Partial<InsertUser>;

