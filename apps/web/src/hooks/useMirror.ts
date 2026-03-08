import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mirrorApi } from "@/lib/api";

export function useMirror(entryId: string | undefined) {
  return useQuery({
    queryKey: ["mirror", entryId],
    queryFn: async () => {
      if (!entryId) throw new Error("No entry ID");
      const res = await mirrorApi.get(entryId);
      if (res.error) {
        // 404 = no analysis yet, not an error
        if (res.error.code === "NOT_FOUND") return null;
        throw new Error(res.error.message);
      }
      return res.data!;
    },
    enabled: !!entryId,
  });
}

export function useTriggerMirror() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const res = await mirrorApi.trigger(entryId);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: (_data, entryId) => {
      queryClient.invalidateQueries({ queryKey: ["mirror", entryId] });
      queryClient.invalidateQueries({ queryKey: ["entry", entryId] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
