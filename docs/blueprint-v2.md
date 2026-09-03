# Blueprint Teknis — Syarfani Akbar Portfolio V2

Dokumen ini adalah blueprint final yang sudah mencakup **revisi kecil** yang disepakati sebelum implementasi.

Status: **APPROVED FOR PLANNING** (belum implementasi)  
Revisi dicatat di bagian bawah sebagai changelog.

---

## 1. Konteks & Sumber Konten

Project membangun personal portfolio modern dengan CMS/Admin agar seluruh konten dapat dikelola tanpa mengubah source code.

Sumber konten (tidak dikarang):
- **CV PDF** — `CV New Update Syarfani Akbar.pdf` (profil, pendidikan, pengalaman, organisasi, skill).
- **Portfolio lama** — `portfolio-syarfaniakbar.vercel.app` (6 project, hero stats, social links, branding "Barsolution").

> Aturan: field yang datanya tidak tersedia (mis. GitHub URL, live demo, level skill tertentu) **dibiarkan kosong/null**, tidak diisi placeholder yang menyerupai data asli.

---

## 2. Keputusan Revisi (Rev 1–11)

| # | Revisi | Keputusan |
|---|---|---|
| 1 | Versi Next.js | Tidak mengunci versi. Pakai **latest stable** yang tersedia saat implementasi Phase 0 (via `create-next-app@latest`, App Router). |
| 2 | Auth sederhana | **Auth.js (NextAuth) + Credential Provider + bcrypt + JWT session**. Satu user admin saja. Tanpa sistem role/permission multi-user. |
| 3 | Storage SATU provider | **Vercel Blob** saja (single provider, tanpa abstraction layer multi-provider). Dipakai untuk: foto profile, project thumbnail, project gallery, certificate image, resume. |
| 4 | Rich text editor ringan | **Markdown** via textarea + render server-side (`react-markdown`). Tanpa editor besar (TipTap/ProseMirror/Slate). Case study disusun dalam section field terstruktur. |
| 5 | Database | **PostgreSQL + Prisma ORM** (tetap). |
| 6 | Konten tidak hardcoded | Seluruh konten publik (profile, project, experience, education, skill, certificate, social link) **hanya dari database**. Yang boleh statis hanya konfigurasi teknis non-konten (brand name, paths, manifest, dll). |
| 7 | Ordering/reordering | CMS mendukung `order` untuk **project, experience, education, skills, certificates, social links**. |
| 8 | Case study fleksibel | Semua field case study **opsional** (nullable). Section yang kosong **otomatis tidak dirender** di halaman publik. |
| 9 | UI direction | **Soft Creative Engineering**: modern, premium, soft, sedikit playful, professional; tidak terlalu clean/kosong, tidak terlalu ramai. Hindari hacker aesthetic, neon, particle, heavy 3D, excessive gradients, excessive animations. |
| 10 | Mobile-first | **Semua public page DAN admin dashboard usable di mobile.** Admin mobile-first layout (form stacked, tabel berubah jadi card). |
| 11 | Update sebelum Phase 0 | Dokumen ini = hasil update. Final stack di bawah. |

---

## 3. Final Technology Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Framework | **Next.js (App Router, RSC)** — latest stable saat implementasi | Server Components untuk halaman publik (ringan, SEO). |
| Language | **TypeScript** | Strict mode. |
| Styling | **Tailwind CSS** | Utility system, mobile-first. |
| Database | **PostgreSQL** (Neon — serverless Postgres) | Connection pooling untuk Vercel. |
| ORM | **Prisma** | Schema + migration + seed. |
| Auth | **Auth.js (NextAuth) + Credential Provider** | JWT session di cookie httpOnly. |
| Password | **bcrypt** | Hash + salt. |
| Storage | **Vercel Blob** (single provider) | Profile photo, thumbnails, gallery, certificate images, resume. |
| Rich text | **Markdown** (textarea + `react-markdown` render) | Ringan, maintainable, tanpa editor besar. |
| Validasi | **Zod** | Server-side validation (auth + semua form CMS). |
| Deploy | **Vercel** | Env set di dashboard, tidak di repo. |

**TIDAK digunakan** (sesuai prinsip minimal): multi-user auth system, CMS third-party (Payload/Sanity), state management library, styling library selain Tailwind, editor rich-text besar.

---

## 4. Folder Structure

```
portfolio-v2/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/                     # hanya aset non-konten (favicon, og profile, manifest)
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Home
│   │   │   ├── about/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx         # case study
│   │   │   ├── skills/page.tsx
│   │   │   ├── certificates/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx              # protected + responsive admin shell
│   │   │       ├── page.tsx                # Dashboard
│   │   │       ├── profile/page.tsx
│   │   │       ├── projects/page.tsx
│   │   │       ├── projects/[id]/page.tsx  # edit (termasuk case study + images + reorder)
│   │   │       ├── experience/page.tsx
│   │   │       ├── education/page.tsx
│   │   │       ├── skills/page.tsx
│   │   │       ├── certificates/page.tsx
│   │   │       ├── social-links/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── files/route.ts              # Vercel Blob (upload/list/delete)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # Button, Input, Badge, ReorderList, dll
│   │   ├── public/                         # Navbar, Footer, Hero, ProjectCard, Section, dll
│   │   └── admin/                          # AdminForm, ImageUploader, Shell, dll
│   ├── lib/
│   │   ├── db.ts                           # Prisma client (server-only)
│   │   ├── auth.ts                         # NextAuth config
│   │   ├── blob.ts                         # Vercel Blob wrapper (single provider, tipis)
│   │   ├── markdown.ts                     # react-markdown helpers
│   │   └── utils.ts
│   ├── server/
│   │   ├── projects.ts
│   │   ├── profile.ts
│   │   ├── experience.ts
│   │   ├── education.ts
│   │   ├── skills.ts
│   │   ├── certificates.ts
│   │   ├── social-links.ts
│   │   └── settings.ts
│   ├── types/
│   │   └── index.ts                        # shared types (Project, CaseStudySection, dll)
│   └── config/
│       └── site.ts                         # konfigurasi teknis NON-konten (nama brand, nav labels)
├── .env
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

> Catatan Rev 6: Folder `src/config/site.ts` hanya berisi konfigurasi teknis non-konten (nama aplikasi, label navigasi, path aset default). Konten personal tidak ada di sini.

---

## 5. Database Schema / ERD

```
┌──────────────┐     ┌──────────────┐
│     User     │     │   Profile    │
│──────────────│     │──────────────│
│ id (PK)      │     │ id (PK)      │
│ email (uniq) │     │ name         │
│ name         │     │ title        │
│ password(hash)│    │ bio          │
│ createdAt    │     │ photoUrl          (Vercel Blob)
│ updatedAt    │     │ resumeUrl         (Vercel Blob, nullable)
│              │     │ location     │
│              │     │ phone        │
│              │     │ email        │
│              │     │ whatsapp     │
│              │     │ availability │
│              │     │ isActive(frontend)
│              │     │ createdAt/updatedAt
└──────────────┘     └──────────────┘
   (1 admin user)
┌──────────────────┐
│     Project      │         ┌──────────────────┐
│──────────────────│         │  ProjectImage    │
│ id (PK)          │ 1───*   │──────────────────│
│ title            │         │ id (PK)          │
│ slug (uniq)      │         │ projectId (FK)   │
│ shortDescription │         │ url (Vercel Blob)│
│ description      │         │ alt              │
│ overview         │         │ isThumbnail (bool)│
│ role             │         │ sortOrder        │
│ status           │         │ createdAt        │
│ -- case study (nullable):  └──────────────────┘
│ features    (String)      ┌──────────────────┐
│ challenges  (String)      │   Technology     │
│ solutions   (String)      │──────────────────│
│ results     (String)      │ id (PK)          │
│ architecture (String)     │ name (uniq)      │
│ liveUrl (nullable)        │ createdAt        │
│ githubUrl (nullable)      └──────────────────┘
│ order            │          *───*
│ isFeatured (bool)│       (many-to-many `_ProjectTechnology`)
│ isPublished(bool)│
│ publishedAt (n)  │
│ deletedAt (soft) │
│ createdAt/updatedAt
└──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│   Experience     │     │    Education     │
│──────────────────│     │──────────────────│
│ id (PK)          │     │ id (PK)          │
│ title            │     │ institution      │
│ company          │     │ degree           │
│ location (n)     │     │ fieldOfStudy     │
│ startDate        │     │ startDate        │
│ endDate (n)      │     │ endDate (n)      │
│ current (bool)   │     │ gpa (n)          │
│ description (n)  │     │ description (n)  │
│ order            │     │ order            │
│ isPublished (bool)│    │ isPublished (bool)│
│ createdAt/updatedAt│   │ createdAt/updatedAt│
└──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│      Skill       │     │   Certificate    │
│──────────────────│     │──────────────────│
│ id (PK)          │     │ id (PK)          │
│ name             │     │ title            │
│ category         │     │ issuer           │
│ level (n)        │     │ issueDate (n)    │
│ order            │     │ credentialUrl (n)│
│ isPublished (bool)│    │ imageUrl (n, Blob)│
│ createdAt/updatedAt│   │ order            │
└──────────────────┘     │ isPublished (bool)│
┌──────────────────┐     │ createdAt/updatedAt│
│   SocialLink     │     └──────────────────┘
│──────────────────│
│ id (PK)          │     ┌──────────────────┐
│ label            │     │   SiteSetting    │
│ url              │     │──────────────────│
│ icon (n)         │     │ id (PK)          │
│ order            │     │ key (uniq)       │
│ isPublished (bool)│    │ value            │
│ createdAt/updatedAt│   │ (site meta, SEO,
└──────────────────┘     │  hero stats, dsb)
                         │ createdAt/updatedAt
                         └──────────────────┘
```

**Keputusan schema:**
- **Soft delete** hanya di `Project` (`deletedAt`) — project berat (case study + images), aman dikembalikan.
- **Slug unik** di Project — dikelola manual di admin.
- **Order** (`Int`) di Project, Experience, Education, Skill, Certificate, SocialLink → mendukung reorder (Rev 7).
- **Case study field semuanya nullable** (Rev 8) — `overview`, `role`, `features`, `challenges`, `solutions`, `results`, `architecture`, `liveUrl`, `githubUrl`. Section kosong tidak dirender.
- **Timestamps** `createdAt`/`updatedAt` semua tabel.
- **URL file** disimpan langsung dari Vercel Blob (tidak ada kolom storage provider).
- **Single admin**: tabel `User` cukup 1 baris; tidak ada kolom role/permission (Rev 2).

---

## 6. Public Page Structure

```
/                     Home
/about                About
/experience           Experience
/projects             Projects (list)
/projects/[slug]      Case study detail
/skills               Skills
/certificates         Certificates
/contact              Contact
```

**Home flow:** `Hero → About Snapshot → Selected Projects (featured) → Experience → Skills → Education → CTA/Contact`.

- Data halaman 100% dari DB via Prisma (Rev 6). Tidak ada content hardcoded.
- `/projects/[slug]` memakai `generateStaticParams` + `generateMetadata`, render section sesuai data (hanya yang terisi).
- Mobile-first layout (Rev 10) dengan whitespace seimbang, typography kuat, project screenshot sebagai elemen visual utama.

---

## 7. Admin/CMS Structure

```
/admin/login          → login (single admin, Credential + bcrypt)
/admin                → Dashboard (statistik & shortcut)
/admin/profile        → edit profile (termasuk foto via Vercel Blob)
/admin/projects       → list + Add Project (create/edit/delete, publish, featured, reorder)
/admin/projects/[id]  → edit: title, slug, shortDescription, description,
                          case study sections (overview, role, status, technologies,
                          features, challenges, solutions, results, architecture),
                          liveUrl, githubUrl, order, featured, publish,
                          thumbnail upload, gallery upload (reorder), delete images
/admin/experience     → CRUD + reorder
/admin/education      → CRUD + reorder
/admin/skills         → CRUD + reorder (per category)
/admin/certificates   → CRUD + reorder (termasuk upload image)
/admin/social-links   → CRUD + reorder (label/url/icon)
/admin/settings       → site settings (site meta/SEO, hero stats, dsb)
```

- **Admin dashboard mobile-first** (Rev 10): sidebar menjadi drawer di mobile, form satu kolom, tabel list jadi card list.
- Semua CRUD via Server Actions + Zod validation di server.
- Reorder memakai komponen `ReorderList` (drag & touch friendly di mobile).

---

## 8. UI/UX Direction

**Konsep: Soft Creative Engineering** (Rev 9)

- Modern, premium, soft, professional, sedikit playful, tenang.
- Whitespace banyak tetapi tidak kosong (bukan minimalis kosong).
- Typography kuat (display + body, pairing dengan karakter).
- Rounded elements secukupnya; subtle gradient/accent (1–2 warna).
- Micro-interaction ringan (hover lift, subtle fade, active states).
- Project screenshot sebagai elemen visual utama (clean browser mockup frame).
- **Dilarang:** hacker aesthetic, neon, particle, heavy 3D, excessive gradients, excessive animations.
- Mobile-first responsive penuh (public + admin).
- Accessible: semantic HTML, focus states, kontras cukup, keyboard navigable.

Skill `frontend-design` + `ui-ux-pro-max` akan dimuat saat implementasi UI untuk aesthetic yang intentional.

---

## 9. Security Architecture (Sederhana, Single Admin)

| Area | Pendekatan |
|---|---|
| Auth | NextAuth Credential Provider, JWT session httpOnly cookie. |
| Password | bcrypt hash + salt. |
| Proteksi admin | Next.js Middleware `matcher: ['/admin/:path*']` → redirect `/admin/login` jika unauthenticated; cek session juga di setiap admin layout/server action. |
| Validasi | Zod di server (semua payload auth + CMS). |
| Upload | Vercel Blob; validasi tipe file & batas ukuran di server sebelum upload. |
| Env | `DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN` di `.env`; `.env.example` tanpa secret; `.env` di `.gitignore`. |
| Tidak bocor ke client | Prisma hanya di server (`server-only`); komponen client hanya menerima data yang sudah dipetakan. |

---

## 10. Deployment Architecture

```
[ Vercel ]
 ├─ Public pages (RSC/SSG)
 ├─ Admin (server-rendered, protected)
 └─ API/Server Actions (Prisma ↔ Postgres)
        │
        ├──► [ Neon ]  PostgreSQL (serverless, connection pooling)
        └──► [ Vercel Blob ]  storage gambar/file (single provider)
```

- Hosting: Vercel. Env via dashboard.
- Migrasi: `prisma migrate deploy` saat release.
- Seed: `prisma db seed` (content asli CV/portfolio, tanpa data karangan).

---

## 11. Development Phases

| Fase | Scope |
|---|---|
| **0 — Setup** | Init git, `create-next-app@latest` (stable), TS, Tailwind, Prisma schema + migration, `.env`, dok blueprint ini sebagai referensi. |
| **1 — Auth** | NextAuth + bcrypt + protect admin routes + login page. |
| **2 — CMS Modules** | CRUD semua modul + reorder + Vercel Blob upload (profile, thumbnails, gallery, certificate, resume). |
| **3 — Public Pages** | Semua halaman baca dari DB; Navbar/Footer. |
| **4 — Case Study** | `/projects/[slug]` dinamis + section conditional + SEO per project. |
| **5 — SEO/Perf** | metadata, OG, sitemap, robots, image optimization, lazy load, a11y. |
| **6 — Seed Content** | Seed data asli dari CV + portfolio lama. |
| **7 — QA/Polish** | Mobile-first check public + admin, accessibility, empty states. |

---

## Changelog Revisi

- **v2 (sebelum implementasi):** menambahkan 11 keputusan revisi (Next.js latest stable, auth single-admin sederhana, Vercel Blob single provider, markdown ringan, PostgreSQL+Prisma tetap, konten 100% dari DB, ordering di semua modul, case study fleksibel, UI Soft Creative, mobile-first public+admin, update blueprint sebelum Phase 0).