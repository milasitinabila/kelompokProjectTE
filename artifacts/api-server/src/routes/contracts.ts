import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, contractsTable, customersTable, auditLogsTable } from "@workspace/db";
import { CreateContractBody, UpdateContractBody, SignContractBody } from "@workspace/api-zod";

const router: IRouter = Router();

function generateContractNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `STE-${year}/${month}/${seq}`;
}

function mapContract(c: typeof contractsTable.$inferSelect, customerName?: string) {
  return {
    ...c,
    customerName: customerName ?? null,
    totalValue: c.totalValue ? Number(c.totalValue) : 0,
    signedByProvider: c.signedByProvider ?? false,
    signedByCustomer: c.signedByCustomer ?? false,
  };
}

router.get("/contracts", async (req, res): Promise<void> => {
  const status = req.query.status as string | undefined;
  const customerId = req.query.customerId ? parseInt(req.query.customerId as string, 10) : undefined;

  let contracts;
  if (status && customerId) {
    contracts = await db.select().from(contractsTable)
      .where(and(eq(contractsTable.status, status), eq(contractsTable.customerId, customerId)))
      .orderBy(contractsTable.createdAt);
  } else if (status) {
    contracts = await db.select().from(contractsTable)
      .where(eq(contractsTable.status, status))
      .orderBy(contractsTable.createdAt);
  } else if (customerId) {
    contracts = await db.select().from(contractsTable)
      .where(eq(contractsTable.customerId, customerId))
      .orderBy(contractsTable.createdAt);
  } else {
    contracts = await db.select().from(contractsTable).orderBy(contractsTable.createdAt);
  }

  const customers = await db.select({ id: customersTable.id, name: customersTable.name }).from(customersTable);
  const customerMap = new Map(customers.map(c => [c.id, c.name]));

  res.json(contracts.map(c => mapContract(c, customerMap.get(c.customerId) ?? undefined)));
});

router.post("/contracts", async (req, res): Promise<void> => {
  const parsed = CreateContractBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const contractNumber = generateContractNumber();
  const [contract] = await db.insert(contractsTable).values({
    ...parsed.data,
    contractNumber,
    totalValue: parsed.data.totalValue ? String(parsed.data.totalValue) : "0",
  }).returning();

  await db.insert(auditLogsTable).values({
    action: "CREATE_CONTRACT",
    entityType: "contract",
    entityId: contract.id,
    performedBy: "system",
    details: `Contract ${contractNumber} created`,
  });

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, contract.customerId));
  res.status(201).json(mapContract(contract, customer?.name));
});

router.get("/contracts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, id));
  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, contract.customerId));
  res.json(mapContract(contract, customer?.name));
});

router.put("/contracts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdateContractBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.totalValue !== undefined) {
    updateData.totalValue = String(parsed.data.totalValue);
  }

  const [contract] = await db.update(contractsTable).set(updateData).where(eq(contractsTable.id, id)).returning();
  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }

  await db.insert(auditLogsTable).values({
    action: "UPDATE_CONTRACT",
    entityType: "contract",
    entityId: contract.id,
    performedBy: "system",
    details: `Contract ${contract.contractNumber} updated`,
  });

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, contract.customerId));
  res.json(mapContract(contract, customer?.name));
});

router.post("/contracts/:id/sign", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = SignContractBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const now = new Date();
  const updateData: Record<string, unknown> = {};
  if (parsed.data.signerRole === "provider") {
    updateData.signedByProvider = true;
    updateData.providerSignedAt = now;
  } else {
    updateData.signedByCustomer = true;
    updateData.customerSignedAt = now;
  }

  const [existing] = await db.select().from(contractsTable).where(eq(contractsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Contract not found" }); return; }

  const willBeFullySigned =
    (parsed.data.signerRole === "provider" && existing.signedByCustomer) ||
    (parsed.data.signerRole === "customer" && existing.signedByProvider);

  if (willBeFullySigned) updateData.status = "active";

  const [contract] = await db.update(contractsTable).set(updateData).where(eq(contractsTable.id, id)).returning();

  await db.insert(auditLogsTable).values({
    action: "SIGN_CONTRACT",
    entityType: "contract",
    entityId: contract.id,
    performedBy: parsed.data.signerName,
    details: `Contract ${contract.contractNumber} signed by ${parsed.data.signerRole}: ${parsed.data.signerName}`,
  });

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, contract.customerId));
  res.json(mapContract(contract, customer?.name));
});

export default router;
