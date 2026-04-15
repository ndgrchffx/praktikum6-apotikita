import jwt from "jsonwebtoken";

const SECRET = "apotikita_secret_123"; // Ganti dengan secret yang aman [cite: 112]

export function generateToken(payload: any) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1h", // Token berlaku selama 1 jam [cite: 118, 119, 120]
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET); // Verifikasi keaslian token [cite: 123, 125]
  } catch {
    return null; // Return null jika token tidak valid atau expired [cite: 126, 127]
  }
}
