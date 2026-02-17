import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertWaitlist } from "@shared/schema";

export function useWaitlist() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertWaitlist) => {
      const res = await fetch(api.waitlist.create.path, {
        method: api.waitlist.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join waitlist");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the club! 🎾",
        description: "You've been added to the waitlist. We'll be in touch soon.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error joining waitlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
