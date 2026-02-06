import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { registerAudioRoutes } from "./replit_integrations/audio"; // For Mock Interviews
import { chatStorage } from "./replit_integrations/chat/storage";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth
  setupAuth(app);

  // Audio Routes (Mock Interviews)
  registerAudioRoutes(app);

  // Jobs
  app.get(api.jobs.list.path, async (req, res) => {
    const filters = {
      search: req.query.search as string,
      location: req.query.location as string,
      type: req.query.type as string,
    };
    const jobs = await storage.getJobs(filters);
    res.json(jobs);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Get application count for this job
    const applicationCount = await storage.getApplicationCountByJob(job.id);

    res.json({ ...job, applicationCount });
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user as any).role === "student") {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob({ ...input, postedBy: (req.user as any).id });
      res.status(201).json(job);
    } catch (error: any) {
      console.error("Error creating job:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to create job" });
    }
  });

  // Courses
  app.get(api.courses.list.path, async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get(api.courses.recommend.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const user = req.user as any;
    const recommended = await storage.getRecommendedCourses(user.skills || []);
    res.json(recommended);
  });

  // Interviews
  app.get(api.interviews.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const interviews = await storage.getInterviewsByUser((req.user as any).id);
    res.json(interviews);
  });

  app.post(api.interviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    try {
      const input = api.interviews.create.input.parse(req.body);

      // Create a linked chat conversation for the voice integration
      const conversation = await chatStorage.createConversation(`Interview: ${input.jobTitle || "General"}`);

      const interview = await storage.createInterview({
        ...input,
        userId: (req.user as any).id,
        conversationId: conversation.id
      });
      res.status(201).json(interview);
    } catch (error: any) {
      console.error("Error starting interview:", error);
      res.status(500).json({ message: "Failed to start interview session" });
    }
  });

  app.get(api.interviews.get.path, async (req, res) => {
    const interview = await storage.getInterview(Number(req.params.id));
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  });

  app.post(api.interviews.generateFeedback.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

    try {
      const interviewId = Number(req.params.id);
      const interview = await storage.getInterview(interviewId);
      if (!interview) return res.status(404).json({ message: "Interview not found" });
      if (!interview.conversationId) return res.status(400).json({ message: "No session data found" });

      // 1. Get messages from the chat session
      const messages = await chatStorage.getMessagesByConversation(interview.conversationId);
      const transcript = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // 2. Generate AI Feedback
      const prompt = `
        You are an expert career coach. Analyze the following mock interview transcript for the position of "${interview.jobTitle || "General Software Engineer"}".
        
        Transcript:
        ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
        
        Provide feedback in JSON format with two fields:
        1. "score": a number from 0-100
        2. "feedback": an object with "strengths" (array of strings), "improvements" (array of strings), and "summary" (string).
      `;

      const response = await chatStorage.createConversation("Internal Feedback Gen"); // Optional: just using OpenAI directly is better
      const completion = await (await import("./replit_integrations/audio/client")).openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const aiResult = JSON.parse(completion.choices[0].message.content || "{}");

      // 3. Update interview record
      const updatedInterview = await storage.updateInterview(interviewId, {
        transcript: transcript,
        feedback: aiResult.feedback,
        score: aiResult.score
      });

      res.json(updatedInterview);
    } catch (error: any) {
      console.error("Error generating feedback:", error);
      res.status(500).json({ message: "Failed to generate interview feedback" });
    }
  });

  // Applications
  app.get(api.applications.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const user = req.user as any;
    if (user.role === "student") {
      const apps = await storage.getApplicationsByUser(user.id);
      res.json(apps);
    } else {
      // Employer/NGO - get all applications for jobs they posted
      const apps = await storage.getApplicationsByEmployer(user.id);
      res.json(apps);
    }
  });

  app.patch(api.applications.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const user = req.user as any;
    if (user.role === "student") return res.status(401).json({ message: "Students cannot update status" });

    try {
      const { status } = api.applications.updateStatus.input.parse(req.body);
      const app = await storage.updateApplicationStatus(Number(req.params.id), status);
      res.json(app);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post(api.jobs.apply.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const userId = (req.user as any).id;
    const jobId = Number(req.params.id);

    const exists = await storage.checkApplicationExists(jobId, userId);
    if (exists) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const input = api.jobs.apply.input.parse(req.body);
    const app = await storage.createApplication({
      ...input,
      jobId,
      applicantId: userId,
    });
    res.status(201).json(app);
  });

  // Resumes
  app.get(api.resumes.get.path, async (req, res) => {
    const resume = await storage.getResume(Number(req.params.userId));
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  });

  app.post(api.resumes.save.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    try {
      const input = api.resumes.save.input.parse(req.body);
      const resume = await storage.saveResume((req.user as any).id, input);
      res.json(resume);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Profiles
  app.get(api.profiles.get.path, async (req, res) => {
    const username = req.params.username as string;
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(404).json({ message: "Profile not found" });
    const resume = await storage.getResume(user.id);
    res.json({ ...user, resume });
  });

  // Seed Data
  if ((await storage.getJobs()).length === 0) {
    console.log("Seeding data...");

    // Seed Users
    // Not seeding users directly due to password hashing requirements - create via UI

    // Seed Courses
    await storage.createCourse({
      title: "Web Development Bootcamp",
      description: "Learn HTML, CSS, and JavaScript from scratch.",
      provider: "RiseUp Academy",
      category: "Technical",
      url: "https://example.com/web-dev",
      duration: "12 weeks",
      skills: ["HTML", "CSS", "JavaScript"]
    });
    await storage.createCourse({
      title: "Financial Literacy 101",
      description: "Basics of saving, investing, and managing debt.",
      provider: "NGO Partner",
      category: "Foundational",
      url: "https://example.com/finance",
      duration: "4 weeks",
      skills: ["Finance", "Budgeting"]
    });

    // Seed Jobs (Assuming a user exists, but we can't guarantee ID 1 exists yet. 
    // We'll skip job seeding or create a dummy user first if needed, 
    // but better to let user create them or seed responsibly.)
    // Let's create a dummy employer for seeding jobs if storage supports it easily without auth flow.
  }

  // Cleanup old audio (older than 2 days)
  // Run once on startup and then every 12 hours
  const cleanup = async () => {
    try {
      await chatStorage.cleanupOldAudio();
    } catch (error) {
      console.error("Error during audio cleanup:", error);
    }
  };
  cleanup();
  setInterval(cleanup, 12 * 60 * 60 * 1000);

  return httpServer;
}
