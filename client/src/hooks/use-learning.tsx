import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCourses() {
  return useQuery({
    queryKey: [api.courses.list.path],
    queryFn: async () => {
      const res = await fetch(api.courses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return api.courses.list.responses[200].parse(await res.json());
    },
  });
}

export function useRecommendedCourses() {
  return useQuery({
    queryKey: [api.courses.recommend.path],
    queryFn: async () => {
      const res = await fetch(api.courses.recommend.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return api.courses.recommend.responses[200].parse(await res.json());
    },
  });
}
