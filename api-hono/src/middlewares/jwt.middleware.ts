import { createMiddleware } from "hono/factory";
import { verifyToken } from "../utils/jwt";

export const jwtMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization"); // Ambil header Authorization [cite: 153]

  if (!authHeader) {
    return c.json({ message: "Unauthorized, token missing" }, 401); // [cite: 155, 157]
  }

  const token = authHeader.split(" ")[1]; // Ambil string token setelah 'Bearer' [cite: 158]
  const user = verifyToken(token);

  if (!user) {
    return c.json({ message: "Token tidak valid" }, 401); // [cite: 160, 162]
  }

  c.set("user", user); // Simpan data user ke context Hono [cite: 163]
  await next(); // Lanjut ke proses berikutnya [cite: 164]
});
