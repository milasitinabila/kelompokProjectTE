import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, transactionsTable, transactionItemsTable, paymentsTable, productsTable, auditLogsTable } from "@workspace/db";
import { CreateTransactionBody, PayTransactionBody } from "@workspace/api-zod";

const router: IRouter = Router();

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${year}${month}${day}-${seq}`;
}

function mapTx(t: typeof transactionsTable.$inferSelect) {
  return {
    ...t,
    subtotal: Number(t.subtotal),
    discount: Number(t.discount),
    tax: Number(t.tax),
    total: Number(t.total),
  };
}

router.get("/transactions", async (req, res): Promise<void> => {
  const { sessionId, customerId, status, dateFrom, dateTo } = req.query as Record<string, string | undefined>;

  const conditions = [];
  if (sessionId) conditions.push(eq(transactionsTable.sessionId, parseInt(sessionId, 10)));
  if (customerId) conditions.push(eq(transactionsTable.customerId, parseInt(customerId, 10)));
  if (status) conditions.push(eq(transactionsTable.status, status));
  if (dateFrom) conditions.push(gte(transactionsTable.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(transactionsTable.createdAt, new Date(dateTo + "T23:59:59Z")));

  const txs = conditions.length > 0
    ? await db.select().from(transactionsTable).where(and(...conditions)).orderBy(transactionsTable.createdAt)
    : await db.select().from(transactionsTable).orderBy(transactionsTable.createdAt);

  res.json(txs.map(mapTx));
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { items, customerId, sessionId, discount = 0, tax = 0, notes } = parsed.data;

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - discount + tax;

  const invoiceNumber = generateInvoiceNumber();

  const [tx] = await db.insert(transactionsTable).values({
    invoiceNumber,
    sessionId: sessionId ?? null,
    customerId: customerId ?? null,
    subtotal: String(subtotal),
    discount: String(discount),
    tax: String(tax),
    total: String(total),
    status: "pending",
    notes: notes ?? null,
  }).returning();

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    await db.insert(transactionItemsTable).values({
      transactionId: tx.id,
      productId: item.productId,
      productName: product?.name ?? "Unknown",
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      subtotal: String(item.quantity * item.unitPrice),
    });
    if (product) {
      await db.update(productsTable).set({ stock: Math.max(0, (product.stock ?? 0) - item.quantity) }).where(eq(productsTable.id, item.productId));
    }
  }

  await db.insert(auditLogsTable).values({
    action: "CREATE_TRANSACTION",
    entityType: "transaction",
    entityId: tx.id,
    performedBy: "cashier",
    details: `Invoice ${invoiceNumber} created, total: ${total}`,
  });

  res.status(201).json(mapTx(tx));
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id));
  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

  const items = await db.select().from(transactionItemsTable).where(eq(transactionItemsTable.transactionId, id));
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, id));

  res.json({
    ...mapTx(tx),
    items: items.map(i => ({ ...i, unitPrice: Number(i.unitPrice), subtotal: Number(i.subtotal) })),
    payments: payments.map(p => ({ ...p, amount: Number(p.amount) })),
  });
});

router.post("/transactions/:id/pay", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = PayTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  for (const payment of parsed.data.payments) {
    await db.insert(paymentsTable).values({
      transactionId: id,
      method: payment.method,
      amount: String(payment.amount),
      reference: payment.reference ?? null,
    });
  }

  const [tx] = await db.update(transactionsTable).set({ status: "paid" }).where(eq(transactionsTable.id, id)).returning();
  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

  const items = await db.select().from(transactionItemsTable).where(eq(transactionItemsTable.transactionId, id));
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, id));

  await db.insert(auditLogsTable).values({
    action: "PAY_TRANSACTION",
    entityType: "transaction",
    entityId: tx.id,
    performedBy: "cashier",
    details: `Invoice ${tx.invoiceNumber} paid`,
  });

  res.json({
    ...mapTx(tx),
    items: items.map(i => ({ ...i, unitPrice: Number(i.unitPrice), subtotal: Number(i.subtotal) })),
    payments: payments.map(p => ({ ...p, amount: Number(p.amount) })),
  });
});

router.post("/transactions/:id/cancel", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [tx] = await db.update(transactionsTable).set({ status: "cancelled" }).where(eq(transactionsTable.id, id)).returning();
  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }
  res.json(mapTx(tx));
});

export default router;
