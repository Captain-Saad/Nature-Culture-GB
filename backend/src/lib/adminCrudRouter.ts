import { Router } from "express";
import type { ZodType } from "zod";

/**
 * Every Prisma model delegate (prisma.destination, prisma.hotel, ...)
 * structurally matches this shape, so one factory covers Create/Read/
 * Update/Delete for all five admin-managed resources instead of five
 * near-identical route files. Loosely typed on purpose: Zod validates
 * every request body at the boundary (the part that actually matters),
 * and fighting Prisma's generated per-model generics here for marginal
 * type safety isn't worth the noise.
 *
 * Response shape is the raw DB row (Prisma model field names, e.g.
 * Hotel.region rather than the public API's renamed "city") -- this is
 * a separate admin-dashboard contract, not the public frontend's mock
 * data shape from Phase 3.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CrudDelegate {
  findMany: (args?: any) => Promise<unknown[]>;
  findUnique: (args: { where: { id: string } }) => Promise<unknown | null>;
  create: (args: { data: any }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: any }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
}

interface AdminCrudOptions {
  delegate: CrudDelegate;
  createSchema: ZodType;
  updateSchema: ZodType;
  orderBy?: unknown;
}

export function createAdminCrudRouter({ delegate, createSchema, updateSchema, orderBy }: AdminCrudOptions) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const items = await delegate.findMany(orderBy ? { orderBy } : undefined);
    res.json(items);
  });

  router.get("/:id", async (req, res) => {
    const item = await delegate.findUnique({ where: { id: req.params.id } });
    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(item);
  });

  router.post("/", async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const item = await delegate.create({ data: parsed.data });
    res.status(201).json(item);
  });

  router.patch("/:id", async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    try {
      const item = await delegate.update({ where: { id: req.params.id }, data: parsed.data });
      res.json(item);
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await delegate.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  return router;
}
