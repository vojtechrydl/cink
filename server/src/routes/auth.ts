import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { signToken, setAuthCookie, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "Vyplňte všechna pole" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Heslo musí mít alespoň 6 znaků" });
    return;
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Účet s tímto e-mailem již existuje" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
    })
    .returning({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt });

  const token = signToken(user.id);
  setAuthCookie(res, token);

  res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Vyplňte e-mail a heslo" });
    return;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Nesprávný e-mail nebo heslo" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Nesprávný e-mail nebo heslo" });
    return;
  }

  const token = signToken(user.id);
  setAuthCookie(res, token);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, req.userId!))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Uživatel nenalezen" });
    return;
  }

  res.json({ user });
});

export default router;
