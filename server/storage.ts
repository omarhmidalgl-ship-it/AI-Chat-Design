import { db } from "./db";
import { waitlist, matches, userMatches, users, type InsertWaitlist, type WaitlistEntry, type Match, type InsertMatch, type UserProf, type InsertUser } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlist): Promise<WaitlistEntry>;
  checkEmailExists(email: string): Promise<boolean>;

  // User Management
  createUser(user: InsertUser): Promise<UserProf>;
  getUserByEmail(email: string): Promise<UserProf | undefined>;
  getUserById(id: number): Promise<UserProf | undefined>;

  // Matchmaking
  getAvailableMatches(): Promise<Match[]>;
  joinMatch(matchId: number, userId: string): Promise<boolean>;

  // Admin
  getAllUsers(): Promise<UserProf[]>;
  getAllUserMatches(): Promise<(Match & { user: UserProf | null })[]>;
  getAllWaitlist(): Promise<WaitlistEntry[]>;
}

export class MemStorage implements IStorage {
  private waitlist: WaitlistEntry[];
  private matches: Match[];
  private users: UserProf[];
  private userMatches: { matchId: number; userId: string }[];
  private currentWaitlistId: number;
  private currentMatchId: number;
  private currentUserId: number;

  constructor() {
    this.waitlist = [];
    this.users = [];
    this.userMatches = [];
    this.currentWaitlistId = 1;
    this.currentMatchId = 1;
    this.currentUserId = 1;

    // Seed data
    this.matches = [
      { id: 1, location: "Padel Club Central", date: "Tomorrow", time: "18:00", level: "intermediate", currentPlayers: 3, maxPlayers: 4, createdAt: new Date() },
      { id: 2, location: "Main Arena", date: "Friday", time: "10:00", level: "beginner", currentPlayers: 2, maxPlayers: 4, createdAt: new Date() },
      { id: 3, location: "Olympic Court", date: "Saturday", time: "16:00", level: "advanced", currentPlayers: 1, maxPlayers: 4, createdAt: new Date() },
    ];
    this.currentMatchId = 4;

    // Seed Admin User
    this.users.push({
      id: this.currentUserId++,
      fullName: "Omar",
      email: "omar.hmida.lgl@gmail.com",
      password: "Omar1234",
      age: 26,
      phoneNumber: "+216 95 648 070",
      country: "Tunisia",
      isAdmin: true,
      createdAt: new Date(),
    });
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<WaitlistEntry> {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: this.currentWaitlistId++,
      createdAt: new Date(),
    };
    this.waitlist.push(newEntry);
    return newEntry;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    return this.waitlist.some((entry) => entry.email === email);
  }

  async createUser(user: InsertUser): Promise<UserProf> {
    const newUser: UserProf = {
      ...user,
      id: this.currentUserId++,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<UserProf | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUserById(id: number): Promise<UserProf | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getAvailableMatches(): Promise<Match[]> {
    return this.matches;
  }

  async joinMatch(matchId: number, userId: string): Promise<boolean> {
    const match = this.matches.find(m => m.id === matchId);
    if (!match || match.currentPlayers >= match.maxPlayers) return false;

    const alreadyJoined = this.userMatches.some(um => um.matchId === matchId && um.userId === userId);
    if (alreadyJoined) return true;

    this.userMatches.push({ matchId, userId });
    match.currentPlayers++;
    return true;
  }

  async getAllUsers(): Promise<UserProf[]> {
    return this.users;
  }

  async getAllUserMatches(): Promise<(Match & { user: UserProf | null })[]> {
    return this.userMatches.map(um => {
      const match = this.matches.find(m => m.id === um.matchId);
      // userId might be a numeric string or a generic sessionId string
      const user = this.users.find(u => u.id === Number(um.userId) || u.email === um.userId);
      return {
        ...match!,
        user: user || null
      };
    });
  }

  async getAllWaitlist(): Promise<WaitlistEntry[]> {
    return this.waitlist;
  }
}

export class DatabaseStorage implements IStorage {
  async createWaitlistEntry(entry: InsertWaitlist): Promise<WaitlistEntry> {
    if (!db) throw new Error("Database not connected");
    const [created] = await db.insert(waitlist).values(entry).returning();
    return created;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    if (!db) return false;
    const [existing] = await db.select().from(waitlist).where(eq(waitlist.email, email));
    return !!existing;
  }

  async createUser(user: InsertUser): Promise<UserProf> {
    if (!db) throw new Error("Database not connected");
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserByEmail(email: string): Promise<UserProf | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<UserProf | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAvailableMatches(): Promise<Match[]> {
    if (!db) return [];
    return await db.select().from(matches);
  }

  async joinMatch(matchId: number, userId: string): Promise<boolean> {
    if (!db) return false;

    // Check if match exists and is not full
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
    if (!match || match.currentPlayers >= match.maxPlayers) return false;

    // Check if user already joined
    const [existing] = await db.select().from(userMatches).where(
      and(eq(userMatches.matchId, matchId), eq(userMatches.userId, userId))
    );
    if (existing) return true;

    // Join match and increment player count
    await db.insert(userMatches).values({ matchId, userId });
    await db.update(matches)
      .set({ currentPlayers: match.currentPlayers + 1 })
      .where(eq(matches.id, matchId));

    return true;
  }

  async getAllUsers(): Promise<UserProf[]> {
    if (!db) return [];
    return await db.select().from(users);
  }

  async getAllUserMatches(): Promise<(Match & { user: UserProf | null })[]> {
    if (!db) return [];
    const results = await db
      .select({
        match: matches,
        user: users,
      })
      .from(userMatches)
      .leftJoin(matches, eq(userMatches.matchId, matches.id))
      .leftJoin(users, eq(userMatches.userId, users.id.toString()));

    return results.map(r => ({
      ...r.match!,
      user: r.user
    }));
  }

  async getAllWaitlist(): Promise<WaitlistEntry[]> {
    if (!db) return [];
    return await db.select().from(waitlist);
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();
