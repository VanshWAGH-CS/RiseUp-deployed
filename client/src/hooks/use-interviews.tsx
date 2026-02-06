import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertInterview } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useInterviews() {
  return useQuery({
    queryKey: [api.interviews.list.path],
    queryFn: async () => {
      const res = await fetch(api.interviews.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interviews");
      return api.interviews.list.responses[200].parse(await res.json());
    },
  });
}

export function useInterview(id: number) {
  return useQuery({
    queryKey: [api.interviews.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.interviews.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch interview");
      return api.interviews.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInterview) => {
      const res = await fetch(api.interviews.create.path, {
        method: api.interviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create interview session");
      return api.interviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      // Don't show toast here as we usually redirect immediately
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useGenerateFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.interviews.generateFeedback.path, { id });
      const res = await fetch(url, {
        method: api.interviews.generateFeedback.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate feedback");
      return api.interviews.generateFeedback.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, data.id] });
      toast({ title: "Feedback Ready", description: "AI analysis of your interview is complete." });
    },
  });
}
