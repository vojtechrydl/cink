import { Router } from "express";
import { db } from "../db/index.js";
import { trams, sightings } from "../db/schema.js";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = req.userId!;

  const allTrams = await db.select().from(trams).orderBy(asc(trams.number));
  const userSightings = await db
    .select()
    .from(sightings)
    .where(eq(sightings.userId, userId));

  const caughtIds = new Set(userSightings.map((s) => s.tramId));
  const total = allTrams.length;
  const caught = caughtIds.size;
  const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;

  function buildCategoryStat(keyFn: (t: typeof allTrams[0]) => string) {
    const groups = new Map<string, { total: number; caught: number }>();
    for (const tram of allTrams) {
      const key = keyFn(tram);
      const g = groups.get(key) || { total: 0, caught: 0 };
      g.total++;
      if (caughtIds.has(tram.id)) g.caught++;
      groups.set(key, g);
    }
    return [...groups.entries()]
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => a.category.localeCompare(b.category, "cs"));
  }

  const byType = buildCategoryStat((t) => t.type);
  const byColor = buildCategoryStat((t) => t.colorBase);

  function decadeLabel(year: number): string {
    const decade = Math.floor(year / 10) * 10;
    return `${decade}`;
  }
  const byDecade = buildCategoryStat((t) => decadeLabel(t.yearBuilt));

  const lastSighting = userSightings.sort(
    (a, b) => new Date(b.seenAt).getTime() - new Date(a.seenAt).getTime()
  )[0];
  const lastAdded = lastSighting
    ? {
        ...allTrams.find((t) => t.id === lastSighting.tramId)!,
        seenAt: lastSighting.seenAt.toISOString(),
      }
    : null;

  const caughtTrams = allTrams.filter((t) => caughtIds.has(t.id));
  const oldestCaught =
    caughtTrams.length > 0
      ? caughtTrams.reduce((a, b) => (a.yearBuilt < b.yearBuilt ? a : b))
      : null;
  const newestCaught =
    caughtTrams.length > 0
      ? caughtTrams.reduce((a, b) => (a.yearBuilt > b.yearBuilt ? a : b))
      : null;

  res.json({
    total,
    caught,
    percentage,
    byType,
    byColor,
    byDecade,
    lastAdded,
    oldestCaught,
    newestCaught,
  });
});

export default router;
