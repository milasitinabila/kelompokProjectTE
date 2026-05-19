import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, posSessionsTable } from "@workspace/db";
import { OpenPosSessionBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapSession(s: typeof posSessionsTable.$inferSelect) {
  return {
    ...s,
    openingCash: Number(s.openingCash),
    closingCash: s.closingCash != null ? Number(s.closingCash) : null,
    totalRevenue: Number(s.totalRevenue),
  };
}

router.get("/pos/sessions", async (_req, res): Promise<void> => {
  const sessions = await db.select().from(posSessionsTable).orderBy(posSessionsTable.openedAt);
  res.json(sessions.map(mapSession));
});

router.post("/pos/sessions", async (req, res): Promise<void> => {
  const parsed = OpenPosSessionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [session] = await db.insert(posSessionsTable).values({
    cashierName: parsed.data.cashierName,
    openingCash: String(parsed.data.openingCash),
    status: "open",
  }).returning();

  res.status(201).json(mapSession(session));
});

router.post("/pos/sessions/:id/close", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [session] = await db.update(posSessionsTable).set({
    status: "closed",
    closedAt: new Date(),
  }).where(eq(posSessionsTable.id, id)).returning();

  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  res.json(mapSession(session));
});

export default router;
