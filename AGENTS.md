<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context (Phase 0 complete)

**Syarfani Akbar Portfolio V2** — Next.js 16.3.4 (App Router / RSC, Turbopack), TS, Tailwind v4, PostgreSQL (Neon), Prisma 7.10.0, Auth.js (next-auth@5.0.0-beta.32), Vercel Blob. Approved blueprint: `docs/blueprint-v2.md`. Design system: **Soft Creative Engineering** (warm paper base `#f5f1e9`, petrol teal `#0f6b62`, warm amber `#de9422`; Fraunces display + Inter body + IBM Plex Mono; mobile-first for public AND admin).

Stack gotchas:
- ESM (`"type": "module"`), `"@/*"` → `./src/*`.
- Auth.js `auth`/`handlers` from `src/lib/auth.ts` (Credentials + bcryptjs + JWT, single admin). Client login uses `src/lib/auth.client.ts` (`next-auth/react` signIn). Route guard: `src/app/admin/(dashboard)/layout.tsx` (auth → redirect `/admin/login`); `src/proxy.ts` exports `auth as proxy` (Next 16; middleware deprecated).
- Prisma 7: driver adapter required. `src/lib/db.ts` = singleton with `PrismaNeon`. Client import `@/generated/prisma/client` (gitignored). `prisma.config.ts` reads `DATABASE_URL` (runtime) / `DIRECT_URL` (CLI). No `url` in schema.
- Next 16: `params`/`searchParams` are Promise-based; proxy in Node runtime.

Env (in `.env`, gitignored): `DATABASE_URL` (pooled, `-pooler`), `DIRECT_URL` (direct), `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `BLOB_READ_WRITE_TOKEN` (empty). DB `neondb` migrated (`20260901210434_init`), all tables empty (no seed yet — seed is Phase 6). No admin user exists yet → admin login cannot be fully verified until seeded.

Scripts: `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `db:migrate`, `db:deploy`, `db:push`, `db:seed`, `db:studio`. Run lint + typecheck + build before finishing (all currently pass). npm audit: 4 high vulns are transitive in Prisma CLI (`deepmerge-ts`, unused `mysql2`) — leave as-is.
