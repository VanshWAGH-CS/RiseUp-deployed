import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertJob, type InsertApplication } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useJobs(filters?: { search?: string; location?: string; type?: string }) {
  return useQuery({
    queryKey: [api.jobs.list.path, filters],
    queryFn: async () => {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.location) params.append("location", filters.location);
      if (filters?.type) params.append("type", filters.type);
      
      const url = `${api.jobs.list.path}?${params.toString()}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.jobs.list.responses[200].parse(await res.json());
    },
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch job");
      return api.jobs.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const res = await fetch(api.jobs.create.path, {
        method: api.jobs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create job: ${res.statusText}`);
      }
      return api.jobs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job Posted", description: "Your job listing is now live." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useApplyJob() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: number, data: Omit<InsertApplication, "jobId" | "applicantId" | "status"> }) => {
      const url = buildUrl(api.jobs.apply.path, { id: jobId });
      const res = await fetch(url, {
        method: api.jobs.apply.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit application");
      return api.jobs.apply.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Application Sent!", description: "The employer has been notified." });
    },
    onError: (err) => {
      toast({ title: "Application Failed", description: err.message, variant: "destructive" });
    }
  });
}
