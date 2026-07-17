import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { resolve } from "path";
import authRoutes from "./routes/auth.js";
import tramsRoutes from "./routes/trams.js";
import sightingsRoutes from "./routes/sightings.js";
import statsRoutes from "./routes/stats.js";
import { runMigrations } from "./db/migrate.js";
import { seedTrams, seedTestUser } from "./db/seed.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
}

app.use("/api/auth", authRoutes);
app.use("/api/trams", tramsRoutes);
app.use("/api/sightings", sightingsRoutes);
app.use("/api/stats", statsRoutes);

// Paths resolved from the working directory (repo root locally, /app in the
// Docker image) so they hold in both the source and compiled layouts.
const appRoot = process.cwd();

if (process.env.NODE_ENV === "production") {
  const clientDist = resolve(appRoot, "client/dist");
  app.use(express.static(clientDist));
  app.get("/*splat", (_req, res) => {
    res.sendFile(resolve(clientDist, "index.html"));
  });
}

async function start() {
  if (process.env.NODE_ENV === "production") {
    await runMigrations(resolve(appRoot, "server/src/db/migrations"));
    await seedTrams(resolve(appRoot, "seed/trams.json"));
    await seedTestUser();
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
