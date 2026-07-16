# CINK — Sbírka plzeňských tramvají

Webová aplikace pro sbírání tramvají v Plzni. Katalog 104 aktivních vozů, které postupně označuješ jako viděné.

## Spuštění lokálně

### Požadavky
- Node.js 20+
- PostgreSQL

### Setup

```bash
# Nainstaluj závislosti
npm install

# Zkopíruj .env a nastav DATABASE_URL
cp .env.example .env

# Vytvoř DB tabulky
cd server && npx drizzle-kit push && cd ..

# Naplň katalog tramvají
npm run seed:db

# Spusť dev server (client :5173 + server :3000)
npm run dev
```

## Tech stack

- **Frontend:** React + Vite + Tailwind v4 + TanStack Query
- **Backend:** Express + Drizzle ORM + PostgreSQL
- **Auth:** bcrypt + JWT (httpOnly cookie)
