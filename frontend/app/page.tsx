// @ts-nocheck
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        form,
      );

      localStorage.setItem("token", res.data.access_token);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: "Selamat datang di Apotikita.",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.href = "/dashboard";
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: "Email atau password kamu salah!",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/bg-apotikita.png')`,
      }}
    >
      {/* EFEK GLASSMORPHISM: bg-white/30 + backdrop-blur-md */}
      <div className="bg-white/30 backdrop-blur-md p-10 shadow-2xl rounded-[40px] w-full max-w-md border border-white/20 transform transition hover:scale-[1.01]">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-md">
            Apoti<span className="text-blue-200">kita</span>
          </h2>
          <p className="text-white/80 text-xs font-bold mt-2 uppercase tracking-[0.2em] drop-shadow-sm">
            Sistem Manajemen Obat
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-white/90 mb-1 ml-4 uppercase tracking-widest">
              Alamat Email
            </label>
            <input
              type="email"
              className="w-full p-4 bg-white/70 border border-white/40 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition font-semibold text-black placeholder:text-gray-400"
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/90 mb-1 ml-4 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              className="w-full p-4 bg-white/70 border border-white/40 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition font-semibold text-black placeholder:text-gray-400"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl font-black shadow-xl hover:opacity-90 transition-all active:scale-95 mt-4 text-sm tracking-widest">
            MASUK SEKARANG
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-white/90 drop-shadow-md">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-blue-200 font-black hover:text-white hover:underline underline-offset-4 transition"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
