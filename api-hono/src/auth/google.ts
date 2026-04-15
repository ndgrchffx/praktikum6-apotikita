import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import { db } from "../db";
import { generateToken } from "../utils/jwt";

export const googleAuthRoute = new Hono();

googleAuthRoute.use(
  "/google",
  googleAuth({
    client_id: process.env.GOOGLE_CLIENT_ID || "", // Ambil dari .env [cite: 186, 317]
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "", // [cite: 318]
    scope: ["openid", "email", "profile"],
    redirect_uri: "http://localhost:3000/auth/google/callback", // Sesuaikan URI [cite: 188]
  }),
);

googleAuthRoute.get("/google/callback", async (c) => {
  const userGoogle = c.get("user-google" as any); // Data user dari Google
  if (!userGoogle) return c.json({ message: "Gagal login Google" }, 400);

  const email = userGoogle.email;

  // Cek apakah user sudah ada di database Apotikita kamu [cite: 224]
  const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  let dbUser = rows[0];

  if (!dbUser) {
    // Jika belum ada, buat user baru (Registrasi otomatis) [cite: 229, 230]
    const [result]: any = await db.execute(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, "", "user"], // Password kosong karena login via Google [cite: 232, 233]
    );
    dbUser = { id: result.insertId, email, role: "user" };
  }

  // Buat Token JWT untuk session aplikasi [cite: 240, 246]
  const token = generateToken({
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  });
  return c.json({ token, user: dbUser });
});
