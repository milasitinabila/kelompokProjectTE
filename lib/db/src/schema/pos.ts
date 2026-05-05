import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const posSessionsTable = pgTable("pos_sessions", {
  id: serial("id").primaryKey(),
  cashierName: text("cashier_name").notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  openingCash: numeric("opening_cash", { precision: 15, scale: 2 }).notNull().default("0"),
  closingCash: numeric("closing_cash", { precision: 15, scale: 2 }),
  totalTransactions: integer("total_transactions").notNull().default(0),
  totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPosSessionSchema = createInsertSchema(posSessionsTable).omit({ id: true, createdAt: true });
export type InsertPosSession = z.infer<typeof insertPosSessionSchema>;
export type PosSession = typeof posSessionsTable.$inferSelect;
