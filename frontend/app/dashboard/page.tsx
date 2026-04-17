// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation"; // Cuma tambah useSearchParams di sini
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardPage() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", price: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState("user");

  // --- TAMBAHAN: FUNGSI UNTUK DECODE TOKEN & AMBIL ROLE ---
  const decodeRole = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.role || "user");
    } catch (e) {
      setUserRole("user");
    }
  };

  // ==========================================
  // TAMBAHAN: PENANGKAP TOKEN GOOGLE DARI HONO
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      // 1. Jika ada token dari Google (URL), simpan dulu!
      localStorage.setItem("token", tokenFromUrl);
      decodeRole(tokenFromUrl); // Bongkar role dari token baru

      // 2. Tampilkan popup sukses
      Swal.fire({
        icon: "success",
        title: "Login Google Berhasil!",
        text: "Selamat datang kembali di Apotikita.",
        timer: 1500,
        showConfirmButton: false,
      });

      // 3. Bersihkan URL dan ambil data
      router.replace("/dashboard");
      fetchMedicines();
    } else if (!token) {
      // 4. Kalau di storage GAK ADA dan di URL GAK ADA, baru tendang ke login
      router.push("/");
    } else {
      // 5. Kalau sudah ada token di storage, langsung ambil data
      decodeRole(token); // Bongkar role dari token lama
      fetchMedicines();
    }
  }, [searchParams]);
  // ==========================================

  // --- FITUR REFRESH TOKEN (KODINGAN ASLI KAMU) ---
  const handleRefreshToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/refresh",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      localStorage.setItem("token", res.data.access_token);
      decodeRole(res.data.access_token); // Update role setelah refresh

      Swal.fire({
        icon: "success",
        title: "Sesi Diperpanjang",
        text: "Token JWT berhasil diperbarui otomatis.",
        timer: 1000,
        showConfirmButton: false,
      });

      fetchMedicines();
    } catch (err) {
      console.error("Sesi habis, silakan login ulang");
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  const fetchMedicines = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(res.data);
    } catch (err) {
      console.error("Gagal mengambil data");
      //     if (err.response?.status === 401) router.push("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Hanya redirect jika tidak ada token di storage DAN tidak ada di URL
      if (!searchParams.get("token")) {
        router.push("/");
      }
    } else {
      fetchMedicines();
    }
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Inventaris Obat - Apotikita", 14, 15);
    autoTable(doc, {
      head: [["Nama Obat", "Kategori", "Harga"]],
      body: filteredMedicines.map((m) => [
        m.name,
        m.category,
        `Rp ${Number(m.price).toLocaleString()}`,
      ]),
      startY: 20,
    });
    doc.save("laporan-apotikita.pdf");
    Swal.fire("Berhasil!", "Laporan PDF telah diunduh.", "success");
  };

  const handleSort = () => {
    const sorted = [...medicines].sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price,
    );
    setMedicines(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.price) < 0) {
      Swal.fire({
        icon: "error",
        title: "Waduh...",
        text: "Harga tidak boleh negatif!",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/medicines",
        { ...form, price: Number(form.price) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setForm({ name: "", category: "", price: "" });
      fetchMedicines();
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Obat berhasil ditambahkan!.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal. Cek koneksi backend!.",
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin mau hapus?",
      text: "Data ini akan hilang permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          await axios.delete(`http://127.0.0.1:8000/api/medicines/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchMedicines();
          Swal.fire("Terhapus!", "Data obat sudah dibuang.", "success");
        } catch (err) {
          Swal.fire("Gagal!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const hargaTermahal =
    medicines.length > 0 ? Math.max(...medicines.map((m) => m.price)) : 0;

  return (
    <div
      className="flex min-h-screen bg-cover bg-fixed bg-center font-sans"
      style={{ backgroundImage: `url('/bg-apotikita.png')` }}
    >
      <div className="w-72 bg-gradient-to-b from-blue-700 to-purple-900 text-white flex flex-col shadow-2xl">
        <div className="p-8 text-3xl font-black border-b border-white/10 tracking-tighter italic">
          Apoti<span className="text-purple-300">kita</span>
        </div>
        <nav className="flex-1 p-6 space-y-4 mt-4 text-sm font-bold">
          <div
            onClick={() => router.push("/dashboard")}
            className="bg-white/10 p-4 rounded-2xl cursor-pointer flex items-center gap-3"
          >
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>{" "}
            Dashboard
          </div>

          {/* BUNGKUSAN ADMIN: DAFTAR AKUN BARU */}
          {userRole === "admin" && (
            <div
              onClick={() => router.push("/register")}
              className="p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition flex items-center gap-3 text-blue-100"
            >
              Daftar Akun Baru
            </div>
          )}

          <div
            onClick={handleRefreshToken}
            className="p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition flex items-center gap-3 text-xs text-blue-300 italic border border-blue-500/30 mt-10"
          >
            🔄 Perbarui Sesi (JWT Refresh)
          </div>
        </nav>
        <div className="p-6 border-t border-white/10">
          <button
            onClick={() => {
              Swal.fire({
                title: "Yakin mau Logout?",
                text: "Sesi kamu akan berakhir di sini.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Ya, Keluar!",
                cancelButtonText: "Batal",
              }).then((result) => {
                if (result.isConfirmed) {
                  localStorage.removeItem("token");
                  router.push("/");
                }
              });
            }}
            className="w-full bg-red-500 hover:bg-red-600 p-4 rounded-2xl font-bold transition shadow-lg text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto bg-white/30 backdrop-blur-[2px]">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">
            Manajemen <span className="text-blue-600">Obat</span>
          </h1>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 font-bold text-purple-600">
              Harga Tertinggi: Rp {hargaTermahal.toLocaleString()}
            </div>
            <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 font-bold text-blue-600">
              Total: {medicines.length} Produk
            </div>
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-6 py-2 rounded-2xl font-bold shadow-md hover:bg-green-700 transition"
            >
              Cetak PDF
            </button>
          </div>
        </div>

        {/* BUNGKUSAN ADMIN: INPUT DATA BARU */}
        {userRole === "admin" && (
          <div className="bg-white p-8 rounded-3xl shadow-lg mb-8 border border-gray-50">
            <h2 className="text-2xl font-black mb-6 text-blue-900 italic">
              Input Data Baru
            </h2>
            <form onSubmit={handleAdd} className="flex gap-4">
              <input
                className="text-black font-semibold border-2 border-gray-50 p-4 rounded-2xl w-full focus:border-blue-500 outline-none transition"
                placeholder="Nama Obat"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="text-black font-semibold border-2 border-gray-50 p-4 rounded-2xl w-full focus:border-blue-500 outline-none transition"
                placeholder="Kategori"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
              <input
                className="text-black font-semibold border-2 border-gray-50 p-4 rounded-2xl w-48 focus:border-blue-500 outline-none transition"
                type="number"
                min="0"
                placeholder="Harga"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 rounded-2xl font-black shadow-lg shadow-blue-200 transition">
                SIMPAN
              </button>
            </form>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Cari nama obat atau kategori..."
            className="w-full p-4 rounded-2xl border-2 border-white/50 bg-white/80 shadow-sm outline-none focus:border-purple-500 text-black font-medium transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-xs uppercase text-gray-400 font-black tracking-widest">
                <th className="p-6">Nama Obat</th>
                <th className="p-6">Kategori</th>
                <th
                  className="p-6 cursor-pointer hover:text-blue-600"
                  onClick={handleSort}
                >
                  Harga {sortOrder === "asc" ? "↑" : "↓"}
                </th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMedicines.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-blue-50/50 transition duration-300"
                >
                  <td className="p-6 font-bold text-gray-800">{m.name}</td>
                  <td className="p-6">
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-6 font-black text-blue-900">
                    Rp {Number(m.price).toLocaleString()}
                  </td>
                  <td className="p-6 text-center">
                    {/* BUNGKUSAN ADMIN: AKSI EDIT/HAPUS ATAU VIEW ONLY */}
                    {userRole === "admin" ? (
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => router.push(`/dashboard/edit/${m.id}`)}
                          className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-xl font-black text-xs shadow-md shadow-yellow-100"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="bg-red-100 text-red-600 px-5 py-2 rounded-xl font-black text-xs hover:bg-red-600 hover:text-white transition"
                        >
                          HAPUS
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">
                        VIEW ONLY
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMedicines.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-bold italic">
              Data obat tidak ditemukan...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
