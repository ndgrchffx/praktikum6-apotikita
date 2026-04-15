import { Hono } from "hono";
import { db } from "./db";
import { jwtMiddleware } from "./middlewares/jwt.middleware";
import { isAdminMiddleware } from "./middlewares/isAdmin.middleware";
import { googleAuthRoute } from "./auth/google";

const app = new Hono();

// Route OAuth Google [cite: 181]
app.route("/auth", googleAuthRoute);

// Route Publik (Bisa diakses siapa saja)
app.get("/", (c) => c.text("Selamat Datang di API Apotikita!"));

// Route Terproteksi (Harus Login JWT) [cite: 168]
app.get("/medicines", jwtMiddleware, async (c) => {
  const [rows] = await db.execute("SELECT * FROM medicines");
  return c.json(rows);
});

// Route Khusus Admin (Misal: Tambah Obat) [cite: 332]
app.post("/admin/add-medicine", jwtMiddleware, isAdminMiddleware, async (c) => {
  return c.json({ message: "Obat berhasil ditambahkan oleh Admin" });
});

export default app;
