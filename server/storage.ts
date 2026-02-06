import { db } from "./db";
import {
  users, jobs, courses, applications, interviews, resumes,
  type User, type InsertUser,
  type Job, type InsertJob,
  type Course, type InsertCourse,
  type Application, type InsertApplication,
  type Interview, type InsertInterview,
  type Resume, type InsertResume
} from "@shared/schema";
import { eq, ilike, and, desc, or, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User & Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  sessionStore: session.Store;

  // Jobs
  getJobs(filters?: { search?: string, location?: string, type?: string }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  getJobsByEmployer(userId: number): Promise<Job[]>;

  // Courses
  getCourses(): Promise<Course[]>;
  getRecommendedCourses(skills: string[]): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Applications
  createApplication(app: InsertApplication): Promise<Application>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getApplicationsByEmployer(userId: number): Promise<Application[]>;
  getApplicationCountByJob(jobId: number): Promise<number>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  checkApplicationExists(jobId: number, applicantId: number): Promise<boolean>;

  // Interviews
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  updateInterview(id: number, updates: Partial<Interview>): Promise<Interview>;
  getInterviewsByUser(userId: number): Promise<Interview[]>;

  // Resumes
  getResume(userId: number): Promise<Resume | undefined>;
  saveResume(userId: number, resume: Omit<InsertResume, "userId">): Promise<Resume>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Jobs
  async getJobs(filters?: { search?: string, location?: string, type?: string }): Promise<Job[]> {
    let conditions = [];
    if (filters?.search) {
      conditions.push(or(
        ilike(jobs.title, `%${filters.search}%`),
        ilike(jobs.description, `%${filters.search}%`),
        ilike(jobs.company, `%${filters.search}%`)
      ));
    }
    if (filters?.location) {
      conditions.push(ilike(jobs.location, `%${filters.location}%`));
    }
    if (filters?.type) {
      const jobType = filters.type as "full-time" | "part-time" | "contract" | "internship" | "apprenticeship";
      conditions.push(eq(jobs.type, jobType));
    }

    return db.select()
      .from(jobs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async getJobsByEmployer(userId: number): Promise<Job[]> {
    return db.select().from(jobs).where(eq(jobs.postedBy, userId)).orderBy(desc(jobs.createdAt));
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getRecommendedCourses(skills: string[]): Promise<Course[]> {
    return db.select().from(courses);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  // Applications
  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values(insertApp).returning();
    return app;
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async getApplicationsByUser(userId: number): Promise<any[]> {
    const allApplications = await db.select().from(applications).where(eq(applications.applicantId, userId)).orderBy(desc(applications.createdAt));

    return Promise.all(
      allApplications.map(async (app) => {
        const [job] = await db.select().from(jobs).where(eq(jobs.id, app.jobId));
        return { ...app, job };
      })
    );
  }

  async getApplicationsByEmployer(userId: number): Promise<any[]> {
    const employerJobs = await db.select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.postedBy, userId));

    if (employerJobs.length === 0) return [];

    const jobIds = employerJobs.map(j => j.id);

    const allApplications = await db.select()
      .from(applications)
      .where(inArray(applications.jobId, jobIds))
      .orderBy(desc(applications.createdAt));

    const enriched = await Promise.all(
      allApplications.map(async (app) => {
        const [job] = await db.select().from(jobs).where(eq(jobs.id, app.jobId));
        const [applicant] = await db.select().from(users).where(eq(users.id, app.applicantId));
        return {
          ...app,
          job,
          applicant,
        };
      })
    );

    return enriched;
  }

  async getApplicationCountByJob(jobId: number): Promise<number> {
    const result = await db.select().from(applications).where(eq(applications.jobId, jobId));
    return result.length;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [app] = await db.update(applications)
      .set({ status: status as any })
      .where(eq(applications.id, id))
      .returning();
    return app;
  }

  async checkApplicationExists(jobId: number, applicantId: number): Promise<boolean> {
    const [existing] = await db.select()
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.applicantId, applicantId)));
    return !!existing;
  }

  // Interviews
  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const [interview] = await db.insert(interviews).values(insertInterview).returning();
    return interview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async updateInterview(id: number, updates: Partial<Interview>): Promise<Interview> {
    const [interview] = await db.update(interviews).set(updates).where(eq(interviews.id, id)).returning();
    return interview;
  }

  async getInterviewsByUser(userId: number): Promise<Interview[]> {
    return db.select().from(interviews).where(eq(interviews.userId, userId)).orderBy(desc(interviews.createdAt));
  }

  // Resumes
  async getResume(userId: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.userId, userId));
    return resume;
  }

  async saveResume(userId: number, resumeData: Omit<InsertResume, "userId">): Promise<Resume> {
    const existing = await this.getResume(userId);
    if (existing) {
      const [updated] = await db.update(resumes)
        .set({ ...resumeData, updatedAt: new Date() })
        .where(eq(resumes.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(resumes)
        .values({ ...resumeData, userId })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
