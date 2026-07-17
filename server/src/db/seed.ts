import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { db } from "./index.js";
import { trams, users } from "./schema.js";

interface TramSeed {
  number: number;
  type: string;
  color: string;
  colorBase: string;
  yearBuilt: number;
  yearNote: string | null;
  photoUrl: string | null;
  note: string | null;
}

export async function seedTrams(tramsJsonPath: string) {
  const data: TramSeed[] = JSON.parse(readFileSync(tramsJsonPath, "utf-8"));

  console.log(`Seeding ${data.length} trams...`);

  for (const tram of data) {
    await db
      .insert(trams)
      .values({
        number: tram.number,
        type: tram.type,
        color: tram.color,
        colorBase: tram.colorBase,
        yearBuilt: tram.yearBuilt,
        yearNote: tram.yearNote,
        photoUrl: tram.photoUrl,
        note: tram.note,
      })
      .onConflictDoUpdate({
        target: trams.number,
        set: {
          type: tram.type,
          color: tram.color,
          colorBase: tram.colorBase,
          yearBuilt: tram.yearBuilt,
          yearNote: tram.yearNote,
          photoUrl: tram.photoUrl,
          note: tram.note,
        },
      });
  }

  console.log(`Seeded ${data.length} trams successfully.`);
}

// Demo account behind the "Přihlásit jako test" button on the login page.
export async function seedTestUser() {
  const passwordHash = await bcrypt.hash("test1234", 12);
  await db
    .insert(users)
    .values({
      email: "test@cink.cz",
      passwordHash,
      name: "Test",
    })
    .onConflictDoNothing({ target: users.email });
  console.log("Test user ready (test@cink.cz).");
}

// Standalone CLI: `tsx src/db/seed.ts` (local dev, source layout)
if (import.meta.url === `file://${process.argv[1]}`) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  await seedTrams(resolve(__dirname, "../../../seed/trams.json"));
  await seedTestUser();
  process.exit(0);
}
