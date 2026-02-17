import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Waitlist table for landing page
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  skillLevel: text("skill_level").notNull(), // 'beginner', 'intermediate', 'advanced', 'pro'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true
}).extend({
  email: z.string().email(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro'])
});

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlist.$inferSelect;

// Simple chat message structure for the AI Coach Demo
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // For ephemeral sessions
  role: text("role").notNull(), // 'user' | 'assistant' - validated by Zod
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
// Matches table for matchmaking
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  level: text("level").notNull(), // 'beginner', 'intermediate', 'advanced', 'pro'
  currentPlayers: integer("current_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull().default(4),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// Table to track which users are in which matches
export const userMatches = pgTable("user_matches", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  userId: text("user_id").notNull(), // Using session-based IDs for demo
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Users table for registration and profile
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age").notNull(),
  phoneNumber: text("phone_number").notNull(),
  country: text("country").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
}).extend({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  age: z.number().min(5, "You must be at least 5 years old").max(100),
  phoneNumber: z.string().min(6, "Invalid phone number"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProf = typeof users.$inferSelect;

// Login schema - only requires email and password
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
