import jwt from "jsonwebtoken";

// Ambil secret dari environment variabel nanti
const SECRET = "apotikita_super_secret_key_123";

// Fungsi bikin token buat user yang berhasil login
export const generateToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

// Fungsi cek token (dipakai satpam/middleware nanti)
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};
