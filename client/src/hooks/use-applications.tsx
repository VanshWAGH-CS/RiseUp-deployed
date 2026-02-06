import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApplicationResponse } from "@shared/routes";

export function useApplications() {
  return useQuery<ApplicationResponse>({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await fetch(api.applications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(api.applications.updateStatus.path.replace(":id", String(id)), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
    },
  });
}

