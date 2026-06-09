import { Router } from "express";
import { db } from "../../lib/db"; // Sesuaikan path import db-mu
import { serviceStatus } from "../../lib/db/src/schema/service_status";
import { eq } from "drizzle-orm";

const router = Router();

// A. Endpoint Publik (Semua orang bisa lihat)
router.get("/", async (req, res) => {
  const status = await db.select().from(serviceStatus).limit(1);
  res.json(status[0] || { status: "active", message: "Sistem normal" });
});

// B. Endpoint Admin (Hanya admin yang bisa update)
router.patch("/update", async (req, res) => {
  // Anggap saja kamu punya middleware 'adminAuth' atau pengecekan manual
  // PENTING: Pastikan ini hanya bisa diakses user dengan role 'admin'
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: "Akses Ditolak" });
  }

  const { status, message } = req.body;
  await db.update(serviceStatus)
    .set({ status, message, updated_at: new Date() })
    .where(eq(serviceStatus.id, 1)); // Asumsi ID baris status adalah 1
    
  res.json({ message: "Status berhasil diupdate" });
});

export default router;