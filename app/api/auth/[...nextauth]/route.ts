import NextAuth from "next-auth";
import { authOptions } from "../config";
import { getDb } from "../../mongodb";
import { User } from "../../../../models/user";
import bcrypt from "bcrypt";

// --- BOOTSTRAP ADMIN USER ---
(async () => {
  const db = await getDb();
  const userCount = await db.collection("users").countDocuments();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const adminUser: User = {
      id: crypto.randomUUID(),
      name: "Admin",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
    };
    await db.collection("users").insertOne(adminUser);
    console.log("Default admin user created: admin@example.com / admin123");
  }
})();
// --- END BOOTSTRAP ---

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 