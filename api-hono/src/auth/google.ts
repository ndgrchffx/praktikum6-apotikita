import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import { generateToken } from "../utils/jwt";
import { db } from "../db";

const auth = new Hono();

auth.use(
  "/google/*",
  googleAuth({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    scope: ["openid", "email", "profile"],
    redirect_uri: "http://localhost:3000/auth/google/callback",
  }),
);

auth.get("/google/callback", async (c) => {
  const user = (c.get("user-google") as any) || (c.get("user") as any);

  console.log("Data dari Google:", user);

  if (!user) {
    return c.json(
      {
        message: "Google Auth failed",
        detail: "Pastikan library @hono/oauth-providers sudah terinstall",
      },
      400,
    );
  }

  try {
    // 1. Cek email di database
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [user.email],
    );
    let dbUser = rows[0];

    // 2. Jika user baru, tentukan role berdasarkan email
    if (!dbUser) {
      // --- LOGIKA ROLE ADMIN ---
      let role = "user"; // Default semua adalah user biasa

      // Ganti email di bawah ini dengan email yang kamu mau jadikan Admin
      if (
        user.email === "admin@mail.com" ||
        user.email === "nailasalsabila190506@gmail.com"
      ) {
        role = "admin";
      }
      // --------------------------

      const [result]: any = await db.execute(
        "INSERT INTO users (email, role, google_id, name) VALUES (?, ?, ?, ?)",
        [user.email, role, user.sub || user.id, user.name],
      );

      dbUser = {
        id: result.insertId,
        email: user.email,
        role: role, // Masukkan role yang sudah ditentukan
        nama: user.name,
      };
    }

    // 3. Buat JWT Token (Role otomatis masuk ke dalam Payload JWT)
    const token = generateToken({
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role, // Inilah yang akan dicek oleh middleware "admin" kamu nanti
    });

    return c.redirect(`http://localhost:3001/dashboard?token=${token}`);
  } catch (error: any) {
    console.error("Database Error:", error.message);
    return c.json({ message: "Database Error", error: error.message }, 500);
  }
});

export default auth;
