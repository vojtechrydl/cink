import { Router } from "express";
import { db } from "../db/index.js";
import { trams } from "../db/schema.js";
import { asc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const allTrams = await db.select().from(trams).orderBy(asc(trams.number));
  res.json({ trams: allTrams });
});

export default router;
