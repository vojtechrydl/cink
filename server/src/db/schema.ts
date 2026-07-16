import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const trams = pgTable("trams", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  color: varchar("color", { length: 100 }).notNull(),
  colorBase: varchar("color_base", { length: 30 }).notNull(),
  yearBuilt: integer("year_built").notNull(),
  yearNote: varchar("year_note", { length: 200 }),
  photoUrl: varchar("photo_url", { length: 500 }),
  note: text("note"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sightings = pgTable(
  "sightings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tramId: integer("tram_id")
      .notNull()
      .references(() => trams.id, { onDelete: "cascade" }),
    seenAt: timestamp("seen_at").defaultNow().notNull(),
    photoUrl: varchar("photo_url", { length: 500 }),
  },
  (t) => [unique().on(t.userId, t.tramId)]
);
