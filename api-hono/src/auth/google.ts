import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import { generateToken } from "../utils/jwt";
import { db } from "../db";

const auth = new Hono();

// Route untuk memicu halaman login Google
auth.use(
  "/google",
  googleAuth({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    scope: ["openid", "email", "profile"],
  }),
);

// Route Callback: Tempat Google mengirim data user setelah login berhasil
auth.get("/google/callback", async (c) => {
  const user = c.get("user-google" as any);
  if (!user) return c.json({ message: "Google Auth failed" }, 400);

  // 1. Cek apakah email user sudah ada di database Laragon kamu
  const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ?", [
    user.email,
  ]);
  let dbUser = rows[0];

  // 2. Jika belum ada (User Baru), daftarkan otomatis ke database
  if (!dbUser) {
    const [result]: any = await db.execute(
      "INSERT INTO users (email, role, google_id) VALUES (?, ?, ?)",
      [user.email, "user", user.sub],
    );
    dbUser = { id: result.insertId, email: user.email, role: "user" };
  }

  // 3. Buat "Tiket" JWT untuk session di aplikasi kamu
  const token = generateToken({
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  });

  return c.json({
    message: "Login Berhasil!",
    token: token,
    user: dbUser,
  });
});

export default auth;
