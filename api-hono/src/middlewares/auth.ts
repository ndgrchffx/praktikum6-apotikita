import { createMiddleware } from "hono/factory";
import { verifyToken } from "../utils/jwt";

// Satpam 1: Ngecek apakah user sudah login (punya JWT)
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Eits! Kamu harus login dulu" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ message: "Token basi atau salah!" }, 401);
  }

  c.set("jwtPayload", payload);
  await next();
});

// Satpam 2: Ngecek apakah dia Admin (buat fitur hapus/tambah obat)
export const adminMiddleware = createMiddleware(async (c, next) => {
  const payload = c.get("jwtPayload") as any;
  if (payload.role !== "admin") {
    return c.json({ message: "Cuma Admin yang boleh masuk sini!" }, 403);
  }
  await next();
});
