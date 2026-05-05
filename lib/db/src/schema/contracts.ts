import { pgTable, text, serial, timestamp, numeric, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  contractNumber: text("contract_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  serviceType: text("service_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).default("0"),
  paymentMethod: text("payment_method"),
  startDate: date("start_date").notNull(),
  estimatedEndDate: date("estimated_end_date"),
  warrantyPeriod: integer("warranty_period").default(30),
  status: text("status").notNull().default("draft"),
  signedByProvider: boolean("signed_by_provider").notNull().default(false),
  signedByCustomer: boolean("signed_by_customer").notNull().default(false),
  providerSignedAt: timestamp("provider_signed_at", { withTimezone: true }),
  customerSignedAt: timestamp("customer_signed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
