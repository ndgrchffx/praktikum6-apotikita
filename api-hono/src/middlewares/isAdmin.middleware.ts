import { createMiddleware } from "hono/factory";

export const isAdminMiddleware = createMiddleware(async (c, next) => {
  const user = c.get("user") as any;

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden: Khusus Admin!" }, 403); // [cite: 326, 328]
  }

  await next(); // [cite: 329]
});
