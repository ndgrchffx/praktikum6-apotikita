import { Hono } from "hono";
import { db } from "./db";
import { jwtMiddleware } from "./middlewares/jwt.middleware";
import { isAdminMiddleware } from "./middlewares/isAdmin.middleware";
import googleAuthRoute from "./auth/google";
import { generateToken } from "./utils/jwt"; // Import generator token kamu

const app = new Hono();

// 1. Route OAuth Google
app.route("/auth", googleAuthRoute);

// 2. Endpoint Login Manual (Buat Admin Dummy & Test Postman)
app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();

  // Cari user di database
  const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];

  // Verifikasi sederhana (untuk dummy)
  // Catatan: Jika password di DB di-hash, gunakan bcrypt.compare()
  if (!user || user.password !== password) {
    return c.json({ message: "Email atau Password salah!" }, 401);
  }

  // Buat Token JWT yang isinya ID, Email, dan ROLE
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role, // Ini kunci biar lolos isAdminMiddleware
  });

  return c.json({
    message: "Login Manual Berhasil!",
    token: token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// --- ROUTE LAINNYA ---
app.get("/medicines", jwtMiddleware, async (c) => {
  const [rows] = await db.execute("SELECT * FROM medicines");
  return c.json(rows);
});

app.post("/admin/add-medicine", jwtMiddleware, isAdminMiddleware, async (c) => {
  return c.json({ message: "Obat berhasil ditambahkan oleh Admin" });
});

export default app;