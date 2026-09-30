# BuildAI — Data Layer (Tier 3)

This folder contains the complete database specifications, schemas, seed data, and migration configurations for the BuildAI 3-tier project.

## Files

- **`schema.prisma`**: The modern Prisma ORM data model. Can target SQLite or PostgreSQL.
- **`init.sql`**: Universal SQL schema creation script (PostgreSQL, SQLite, MySQL).
- **`seed.sql`**: Initial sample project, architectural parameters, and preliminary estimates.
- **`docker-compose.yml`**: Instant local PostgreSQL database container.

---

## How to Run

### Option 1: SQLite (Zero Configuration)
The backend defaults to SQLite (`file:./dev.db`). No installation or Docker required.

### Option 2: PostgreSQL with Docker
```bash
cd database
docker compose up -d
```
Then update `backend/.env`:
```env
DATABASE_URL="postgresql://buildai_user:buildai_secure_password@localhost:5432/buildai_db?schema=public"
```
And apply the schema:
```bash
cd ../backend
npx prisma db push
```
