import { z } from 'zod';
import {
  insertUserSchema, users,
  insertJobSchema, jobs,
  insertCourseSchema, courses,
  insertApplicationSchema, applications,
  insertInterviewSchema, interviews,
  insertResumeSchema, resumes
} from './schema';

// Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// API Contract
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs',
      input: z.object({
        search: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/jobs/:id',
      responses: {
        200: z.custom<typeof jobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/jobs',
      input: insertJobSchema.omit({ postedBy: true }),
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    apply: {
      method: 'POST' as const,
      path: '/api/jobs/:id/apply',
      input: insertApplicationSchema.omit({ jobId: true, applicantId: true }),
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  courses: {
    list: {
      method: 'GET' as const,
      path: '/api/courses',
      responses: {
        200: z.array(z.custom<typeof courses.$inferSelect>()),
      },
    },
    recommend: {
      method: 'GET' as const,
      path: '/api/courses/recommended',
      responses: {
        200: z.array(z.custom<typeof courses.$inferSelect>()),
      },
    },
  },
  interviews: {
    create: {
      method: 'POST' as const,
      path: '/api/interviews',
      input: insertInterviewSchema,
      responses: {
        201: z.custom<typeof interviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/interviews',
      responses: {
        200: z.array(z.custom<typeof interviews.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/interviews/:id',
      responses: {
        200: z.custom<typeof interviews.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generateFeedback: {
      method: 'POST' as const,
      path: '/api/interviews/:id/feedback',
      responses: {
        200: z.custom<typeof interviews.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications', // For employers to see applicants, students to see their apps
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect & { job?: typeof jobs.$inferSelect, applicant?: typeof users.$inferSelect }>()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/applications/:id/status',
      input: z.object({ status: z.enum(["Applied", "Under Review", "Accepted", "Rejected"]) }),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    }
  },
  resumes: {
    get: {
      method: 'GET' as const,
      path: '/api/resumes/:userId',
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/resumes',
      input: insertResumeSchema.omit({ userId: true }),
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        201: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:username',
      responses: {
        200: z.custom<typeof users.$inferSelect & { resume?: typeof resumes.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LoginRequest = z.infer<typeof api.auth.login.input>;
export type RegisterRequest = z.infer<typeof api.auth.register.input>;
export type JobResponse = z.infer<typeof api.jobs.get.responses[200]>;
export type CourseResponse = z.infer<typeof api.courses.list.responses[200]>[number];
export type InterviewResponse = z.infer<typeof api.interviews.get.responses[200]>;
export type ApplicationResponse = z.infer<typeof api.applications.list.responses[200]>;
export type ResumeResponse = z.infer<typeof api.resumes.get.responses[200]>;

// Export insert types for client use
export type InsertJob = z.infer<typeof api.jobs.create.input>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
