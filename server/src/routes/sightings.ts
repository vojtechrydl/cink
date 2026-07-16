import { Router } from "express";
import { db } from "../db/index.js";
import { sightings, trams } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const userSightings = await db
    .select()
    .from(sightings)
    .where(eq(sightings.userId, req.userId!));
  res.json({ sightings: userSightings });
});

router.post("/", async (req, res) => {
  const { tramId } = req.body;
  if (!tramId) {
    res.status(400).json({ error: "tramId je povinný" });
    return;
  }

  const [tram] = await db
    .select()
    .from(trams)
    .where(eq(trams.id, tramId))
    .limit(1);

  if (!tram) {
    res.status(404).json({ error: "Tramvaj nenalezena" });
    return;
  }

  const [existing] = await db
    .select()
    .from(sightings)
    .where(
      and(eq(sightings.userId, req.userId!), eq(sightings.tramId, tramId))
    )
    .limit(1);

  if (existing) {
    res.json({ sighting: existing });
    return;
  }

  const [sighting] = await db
    .insert(sightings)
    .values({ userId: req.userId!, tramId })
    .returning();

  res.status(201).json({ sighting });
});

router.delete("/:tramId", async (req, res) => {
  const tramId = parseInt(req.params.tramId, 10);
  if (isNaN(tramId)) {
    res.status(400).json({ error: "Neplatné tramId" });
    return;
  }

  await db
    .delete(sightings)
    .where(
      and(eq(sightings.userId, req.userId!), eq(sightings.tramId, tramId))
    );

  res.status(204).end();
});

export default router;
