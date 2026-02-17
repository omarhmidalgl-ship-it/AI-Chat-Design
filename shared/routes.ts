import { z } from 'zod';
import { insertWaitlistSchema, insertChatMessageSchema, chatMessages } from './schema';

export const api = {
  waitlist: {
    create: {
      method: 'POST' as const,
      path: '/api/waitlist' as const,
      input: insertWaitlistSchema,
      responses: {
        201: z.object({ success: z.boolean(), message: z.string() }),
        400: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }) // Conflict/Duplicate
      }
    }
  },
  aiCoach: {
    chat: {
      method: 'POST' as const,
      path: '/api/ai-coach/chat' as const,
      input: z.object({
        message: z.string(),
        sessionId: z.string().optional() // Optional session ID for context
      }),
      responses: {
        200: z.object({
          message: z.string(),
          sessionId: z.string()
        }),
        500: z.object({ message: z.string() })
      }
    }
  }
};

// Helper for URL building
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
