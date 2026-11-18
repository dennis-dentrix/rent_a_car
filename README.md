# Car Rental Platform

Executive car hire and transport platform for Kenya. Specifications are in `docs/`; start with `docs/CLAUDE.md`.

Two applications in one repository: `apps/web` (Next.js) and `apps/api` (Express), with shared code in `packages/shared`.

## Run locally

```bash
npm install
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
npm run db:start
npm run dev:api
npm run dev:web
```

Fill in the Supabase values from `npx supabase status`. The API is at `http://localhost:4000/api/v1`; testing it in Postman is covered in `docs/api-testing.md`.

## Checks

```bash
npm run check
npm run test:db
```
