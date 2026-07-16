import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index.js";

export async function runMigrations(migrationsFolder: string) {
  console.log("Running database migrations...");
  await migrate(db, { migrationsFolder });
  console.log("Migrations up to date.");
}
