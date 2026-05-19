import { Router, type IRouter } from "express";
import { count, sum, eq, desc, gte } from "drizzle-orm";
import { db, customersTable, contractsTable, transactionsTable, productsTable, auditLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [customerCount] = await db.select({ total: count() }).from(customersTable);
  const allContracts = await db.select({ status: contractsTable.status }).from(contractsTable);
  const activeContracts = allContracts.filter(c => c.status === "active").length;
  const pendingContracts = allContracts.filter(c => c.status === "draft").length;

  const allTx = await db.select({ total: transactionsTable.total, status: transactionsTable.status, createdAt: transactionsTable.createdAt }).from(transactionsTable);
  const paidTx = allTx.filter(t => t.status === "paid");
  const totalRevenue = paidTx.reduce((sum, t) => sum + Number(t.total), 0);
  const totalTransactions = paidTx.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTx = paidTx.filter(t => new Date(t.createdAt) >= today);
  const revenueToday = todayTx.reduce((sum, t) => sum + Number(t.total), 0);
  const transactionsToday = todayTx.length;

  const lowStockProducts = await db.select().from(productsTable);
  const lowStock = lowStockProducts.filter(p => p.stock <= (p.minStock ?? 5)).length;

  res.json({
    totalRevenue,
    totalTransactions,
    activeContracts,
    totalCustomers: Number(customerCount?.total ?? 0),
    revenueToday,
    transactionsToday,
    pendingContracts,
    lowStockProducts: lowStock,
  });
});

router.get("/dashboard/revenue-chart", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const txs = await db.select({
    total: transactionsTable.total,
    status: transactionsTable.status,
    createdAt: transactionsTable.createdAt,
  }).from(transactionsTable).where(gte(transactionsTable.createdAt, thirtyDaysAgo));

  const paidTxs = txs.filter(t => t.status === "paid");

  const byDate = new Map<string, { revenue: number; transactionCount: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    byDate.set(key, { revenue: 0, transactionCount: 0 });
  }

  for (const tx of paidTxs) {
    const key = new Date(tx.createdAt).toISOString().split("T")[0];
    const entry = byDate.get(key);
    if (entry) {
      entry.revenue += Number(tx.total);
      entry.transactionCount += 1;
    }
  }

  const result = Array.from(byDate.entries()).map(([date, data]) => ({ date, ...data }));
  res.json(result);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(10);

  const activities = logs.map(l => {
    let type: string = "security";
    if (l.entityType === "transaction") type = "transaction";
    else if (l.entityType === "contract") type = "contract";
    else if (l.entityType === "customer") type = "customer";

    return {
      id: l.id,
      type,
      title: l.action.replace(/_/g, " "),
      description: l.details ?? `${l.action} on ${l.entityType}`,
      amount: null,
      status: "completed",
      createdAt: l.createdAt,
    };
  });

  res.json(activities);
});

router.get("/dashboard/contract-stats", async (_req, res): Promise<void> => {
  const contracts = await db.select({
    status: contractsTable.status,
    totalValue: contractsTable.totalValue,
  }).from(contractsTable);

  const stats = { draft: 0, active: 0, completed: 0, cancelled: 0, totalValue: 0 };
  for (const c of contracts) {
    const s = c.status as keyof typeof stats;
    if (s in stats && s !== "totalValue") (stats[s] as number)++;
    stats.totalValue += Number(c.totalValue ?? 0);
  }

  res.json(stats);
});

export default router;
