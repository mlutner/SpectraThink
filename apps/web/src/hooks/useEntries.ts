import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entriesApi } from "@/lib/api";

export function useEntries() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await entriesApi.list();
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });
}

export function useEntry(id: string | undefined) {
  return useQuery({
    queryKey: ["entry", id],
    queryFn: async () => {
      if (!id) throw new Error("No entry ID");
      const res = await entriesApi.get(id);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await entriesApi.create(content);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { content?: string; title?: string };
    }) => {
      const res = await entriesApi.update(id, data);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry", variables.id] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await entriesApi.delete(id);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
