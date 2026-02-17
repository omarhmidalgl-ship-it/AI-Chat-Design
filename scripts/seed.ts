
import { storage } from "../server/storage";
import { insertWaitlistSchema } from "../shared/schema";

async function runSeed() {
  console.log("Seeding database...");

  const testEmail = "demo@chatpadel.com";
  const exists = await storage.checkEmailExists(testEmail);

  if (!exists) {
    await storage.createWaitlistEntry({
      email: testEmail,
      name: "Demo User",
      skillLevel: "intermediate"
    });
    console.log("Added demo user to waitlist");
  } else {
    console.log("Demo user already exists");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

runSeed().catch(console.error);
