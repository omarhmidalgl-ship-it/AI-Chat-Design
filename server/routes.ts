import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { notifications } from "./notifications";

// Initialize OpenAI client
const openai = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
}) : null;

if (!openai) {
  console.warn("OpenAI API key missing. AI Coach will use mock responses.");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Waitlist API
  app.post(api.waitlist.create.path, async (req, res) => {
    try {
      const input = api.waitlist.create.input.parse(req.body);

      const exists = await storage.checkEmailExists(input.email);
      if (exists) {
        return res.status(409).json({ message: "Email already in waitlist" });
      }

      await storage.createWaitlistEntry(input);
      res.status(201).json({ success: true, message: "Successfully joined waitlist!" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Waitlist error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Matchmaking API
  app.get("/api/matches", async (_req, res) => {
    const availableMatches = await storage.getAvailableMatches();
    res.json(availableMatches);
  });

  app.post("/api/matches/join", async (req, res) => {
    const { matchId, sessionId } = req.body;
    const success = await storage.joinMatch(Number(matchId), sessionId);

    if (success) {
      // Find match and user details for notification
      const availableMatches = await storage.getAvailableMatches();
      const match = availableMatches.find(m => m.id === Number(matchId));

      // Attempt to find user (sessionId is often the userId in numeric string form)
      const userIdNum = Number(sessionId);
      const user = !isNaN(userIdNum) ? await storage.getUserById(userIdNum) : await storage.getUserByEmail(sessionId);

      if (user && match) {
        // Trigger notifications in background
        notifications.sendMatchJoinedEmail(user.email, user.fullName, {
          location: match.location,
          date: match.date,
          time: match.time
        }).catch(err => console.error("Email notification failed", err));

        notifications.sendMatchJoinedSMS(user.phoneNumber, {
          location: match.location,
          date: match.date,
          time: match.time
        }).catch(err => console.error("SMS notification failed", err));
      }

      res.json({ success: true, message: "Joined match successfully! Notifications sent." });
    } else {
      res.status(400).json({ success: false, message: "Failed to join match. It might be full." });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const user = await storage.createUser(userData);
      
      // Send welcome email
      notifications.sendEmail(
        user.email,
        "Welcome to ChatPadel! 🎾",
        `Hello ${user.fullName},\n\nWelcome to ChatPadel! Your account has been successfully created.\n\nYou can now:\n- Join matches with other padel players\n- Get coaching tips from our AI Coach\n- Connect with the padel community\n\nEnjoy your padel journey!\n\nBest regards,\nThe ChatPadel Team`
      ).catch(err => console.error("Welcome email failed", err));
      
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json(user);
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        // We return success anyway to avoid email enumeration
        return res.json({ success: true, message: "If an account exists with this email, a reset link has been sent." });
      }

      // Simulate sending a reset link
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${Math.random().toString(36).substring(7)}`;
      await notifications.sendResetPasswordEmail(user.email, resetLink);

      res.json({ success: true, message: "If an account exists with this email, a reset link has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Admin APIs
  const isAdmin = async (req: any, res: any, next: any) => {
    const email = req.headers["x-user-email"];
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUserByEmail(email as string);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  };

  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/admin/user-matches", isAdmin, async (_req, res) => {
    const joins = await storage.getAllUserMatches();
    res.json(joins);
  });

  app.get("/api/admin/waitlist", isAdmin, async (_req, res) => {
    const list = await storage.getAllWaitlist();
    res.json(list);
  });

  // AI Coach Chat API
  app.post(api.aiCoach.chat.path, async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const currentSessionId = sessionId || Math.random().toString(36).substring(7);

      // Professional Prompt engineering for the Padel Coach
      const systemPrompt = `You are an elite, all-knowing Padel Coach AI named "ChatPadel Pro". 
      Your personality is sophisticated, encouraging, and extremely knowledgeable.
      While your primary expertise is Padel strategy, rules, and technique, you are capable of answering ANY question the user asks with professional grace.
      Always try to subtly relate the answer back to Padel if possible, but don't force it if the topic is completely different.
      
      Matchmaking Rules:
      If the user wants to "find a match", "join a session", "play tomorrow", or any intent related to finding a game, you MUST:
      1. Respond enthusiastically.
      2. Include the EXACT keyword "[MATCH_FINDER]" in your response.
      
      Example: "I'd love to help you find a match! Here are some sessions available: [MATCH_FINDER]"`;

      if (!openai) {
        // Handle common intents in demo mode with professional responses
        const msg = message.toLowerCase();

        // Matchmaking Intent
        if (msg.includes("match") || msg.includes("session") || msg.includes("join") || msg.includes("play")) {
          const availableMatches = await storage.getAvailableMatches();
          return res.json({
            message: "I've found some excellent matches for you! As your coach, I recommend joining one of these to keep your momentum going. 🎾 [MATCH_FINDER]",
            sessionId: currentSessionId,
            matches: availableMatches
          });
        }

        // Greeting Intent
        if (msg.includes("hello") || msg.includes("hi ") || msg === "hi" || msg.includes("hey")) {
          return res.json({
            message: "Hello! I'm ChatPadel Pro, your elite Padel coach. I'm here to help you master the court, whether it's perfecting your bandeja or finding your next match. How can I assist you today?",
            sessionId: currentSessionId
          });
        }

        // Tactics/Help Intent
        if (msg.includes("tactic") || msg.includes("help") || msg.includes("tip") || msg.includes("improve")) {
          return res.json({
            message: "Improving your game is all about consistency. My top tip for today: Focus on your 'split step' just before your opponent hits the ball. It improves your reaction time significantly. Would you like more specific tactical advice?",
            sessionId: currentSessionId
          });
        }

        // Default Professional Response
        return res.json({
          message: "That's a great question. As an elite coach, I always say that the mental game is just as important as the physical. I'm currently running in a specialized performance mode, but I can certainly help you find a match or give you some quick tactical tips! What are you looking to achieve today?",
          sessionId: currentSessionId
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_completion_tokens: 500,
      });

      let aiMessage = response.choices[0]?.message?.content || "I couldn't generate a response. Let's try a forehand volley instead!";

      let matches = undefined;
      if (aiMessage.includes("[MATCH_FINDER]")) {
        matches = await storage.getAvailableMatches();
      }

      res.json({
        message: aiMessage,
        sessionId: currentSessionId,
        matches
      });

    } catch (err) {
      console.error("AI Coach error:", err);
      res.status(500).json({ message: "Failed to reach the AI Coach" });
    }
  });

  return httpServer;
}
