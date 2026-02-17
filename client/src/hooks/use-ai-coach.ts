import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useState } from "react";
import { type Match } from "@shared/schema";

type ChatResponse = {
  message: string;
  sessionId: string;
  matches?: Match[];
};

export function useAiCoach() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(api.aiCoach.chat.path, {
        method: api.aiCoach.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to get coaching advice");
      }

      const data: ChatResponse = await res.json();
      setSessionId(data.sessionId); // Update session ID for continuity
      return data;
    },
  });
}
