# Instructions for updating .env file

Please update your `.env` file with the following content:

```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://neondb_owner:npg_ITNehzgfa32k@ep-dawn-shape-a48ndbem-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="teenchat-secret-key-2025-change-in-production"
```

After updating, run:
```bash
npx prisma migrate dev --name init_postgres
```
