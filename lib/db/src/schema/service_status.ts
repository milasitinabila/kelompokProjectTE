import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const serviceStatus = pgTable("service_status", {
  id: serial("id").primaryKey(),
  status: text("status").default("active"), // contoh: 'active', 'maintenance'
  message: text("message").default("Sistem berjalan normal"),
  updated_at: timestamp("updated_at").defaultNow(),
});