# Syarfani Akbar Portfolio

A personal portfolio website with a full content-management system (CMS) for IT infrastructure and software engineering work.

## Overview

- **Public portfolio** — home, about, experience, projects (with case studies), skills, certificates, and contact.
- **Admin CMS** — a password-protected admin area to manage every piece of content, with image/file uploads.
- Built as an App Router / React Server Components application with a PostgreSQL data layer.

## Stack

- **Next.js** (App Router, React Server Components, Turbopack)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (ORM) + **PostgreSQL** (Neon)
- **Auth.js** (NextAuth v5, Credentials + JWT)
- **Vercel Blob** (image/file storage)

## Features

- Public portfolio pages with project case studies, experience, education, skills, certificates, and contact.
- Admin CMS (`/admin`) with modules for profile, social links, projects, technologies, experience, education, skills, certificates, and settings.
- Publish/unpublish, featured flag, and drag-free ordering for content.
- Authenticated image/file uploads (Vercel Blob) with server-side validation.
- Sitemap, robots, and Open Graph metadata for SEO.

## Prerequisites

- **Node.js** 18.18+ (or newer LTS)
- **npm**
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech)) — pooled connection for the app, direct connection for CLI/migrations.
- A **Vercel Blob** store for image/uploads.
- An **Auth.js** secret for the admin session.

## Environment variables

Copy `.env.example` to `.env` and fill in real values. `.env.example` is the source of truth for the required variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL pooled connection (app runtime, Prisma driver adapter) |
| `DIRECT_URL` | PostgreSQL direct connection (Prisma CLI / migrations) |
| `AUTH_SECRET` | Auth.js session secret |
| `AUTH_TRUST_HOST` | Set `true` for local/trusted hosting |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed credentials for the single admin account |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image/file uploads |
| `NEXT_PUBLIC_SITE_URL` | Public site origin (no trailing slash) used for sitemap/robots/Open Graph |

Never commit `.env` — it is gitignored.

## Local development

```bash
# install dependencies
npm install

# set up the database (after configuring .env)
npm run db:migrate        # apply migrations
npm run db:generate       # generate the Prisma client
npm run db:seed           # (optional) seed data
npm run admin:create      # create/update the admin user

# run the development server
npm run dev

# quality & verification
npm run lint
npm run typecheck
npm run build
npm run start             # serve the production build locally
```

Open `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the CMS (login to access the dashboard).

## Deployment

Deployment (Vercel) and production environment variables will be configured in a later phase. When deploying, set the same variables as in `.env` — including `NEXT_PUBLIC_SITE_URL` — in the hosting provider's environment, and run database migrations (`npm run db:deploy`) against the production database.
