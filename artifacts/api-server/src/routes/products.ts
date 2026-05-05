import { Router, type IRouter } from "express";
import { eq, ilike, and, or } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { CreateProductBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  let products;
  if (search && category) {
    products = await db.select().from(productsTable).where(
      and(
        or(ilike(productsTable.name, `%${search}%`), ilike(productsTable.sku, `%${search}%`)),
        eq(productsTable.category, category)
      )
    ).orderBy(productsTable.name);
  } else if (search) {
    products = await db.select().from(productsTable).where(
      or(ilike(productsTable.name, `%${search}%`), ilike(productsTable.sku, `%${search}%`))
    ).orderBy(productsTable.name);
  } else if (category) {
    products = await db.select().from(productsTable).where(eq(productsTable.category, category)).orderBy(productsTable.name);
  } else {
    products = await db.select().from(productsTable).orderBy(productsTable.name);
  }

  res.json(products.map(p => ({ ...p, price: Number(p.price) })));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
  }).returning();
  res.status(201).json({ ...product, price: Number(product.price) });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ ...product, price: Number(product.price) });
});

router.put("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.update(productsTable).set({
    ...parsed.data,
    price: String(parsed.data.price),
  }).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ ...product, price: Number(product.price) });
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ success: true, message: "Product deleted" });
});

export default router;
