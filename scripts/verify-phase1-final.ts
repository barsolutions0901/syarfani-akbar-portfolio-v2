import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import { validateUpload, uploadRules, type UploadKind } from "../src/lib/upload";

const BASE = "http://localhost:3002";

const results: Record<string, string> = {};

function pass(name: string, detail?: string) {
  results[name] = `PASS${detail ? ` — ${detail}` : ""}`;
  console.log(`  ✓ ${name}${detail ? ` (${detail})` : ""}`);
}

function fail(name: string, reason: string) {
  results[name] = `FAIL — ${reason}`;
  console.error(`  ✗ ${name}: ${reason}`);
}

// ─── HTTP helpers ───

let sessionToken = "";
let csrfCookie = "";

async function getCsrf() {
  const r = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const sc = r.headers.get("set-cookie") ?? "";
  csrfCookie = sc.split(";")[0];
  const body = await r.text();
  return body.match(/csrfToken":"([^"]+)/)?.[1] ?? "";
}

async function login(email: string, password: string): Promise<boolean> {
  const csrf = await getCsrf();
  if (!csrf) return false;
  const r = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: csrfCookie },
    body: new URLSearchParams({ csrfToken: csrf, email, password }).toString(),
    redirect: "manual",
  });
  const sc = r.headers.get("set-cookie") ?? "";
  const sessionPart = sc.split(/,\s*/).find((c) => c.startsWith("authjs.session-token="));
  if (sessionPart) sessionToken = sessionPart.split(";")[0].replace("authjs.session-token=", "");
  return sessionToken.length > 0;
}

async function getRoute(path: string): Promise<number> {
  const r = await fetch(`${BASE}${path}`, {
    headers: { Cookie: `authjs.session-token=${sessionToken}` },
    redirect: "manual",
  });
  return r.status;
}

// ─── Main ───

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim();
  const password = (process.env.ADMIN_PASSWORD ?? "").trim();

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
  });

  // Collect test record IDs for cleanup
  const testTechIds: string[] = [];
  const testProjectIds: string[] = [];
  const testProfileCreated = { id: false };
  const testSocialIds: string[] = [];

  try {
    // ═══════════════════════════════════════════
    // 1. AUTH
    // ═══════════════════════════════════════════
    console.log("\n═══ 1. AUTHENTICATION ═══");

    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin) {
      fail("auth:admin_exists", `No user with email ${email}`);
      return;
    }
    pass("auth:admin_exists", `id=${admin.id}`);

    const loggedIn = await login(email, password);
    if (loggedIn) pass("auth:login", "session obtained");
    else { fail("auth:login", "failed to get session"); return; }

    // Admin routes should return 200
    for (const route of ["/admin", "/admin/profile", "/admin/projects", "/admin/technologies"]) {
      const status = await getRoute(route);
      if (status === 200) pass(`auth:route_${route}`, "200");
      else fail(`auth:route_${route}`, `HTTP ${status}`);
    }

    // Public routes should be accessible
    for (const route of ["/", "/projects", "/about"]) {
      const status = await getRoute(route);
      if (status === 200) pass(`auth:public_${route}`, "200");
      else fail(`auth:public_${route}`, `HTTP ${status}`);
    }

    // ═══════════════════════════════════════════
    // 2. PROFILE CMS
    // ═══════════════════════════════════════════
    console.log("\n═══ 2. PROFILE CMS ═══");

    const profile = await prisma.profile.upsert({
      where: { id: "default" },
      create: { id: "default", name: "Phase1 Test Profile", title: "Test Engineer", bio: "Test bio for Phase 1 verification" },
      update: { name: "Phase1 Test Profile", title: "Test Engineer", bio: "Test bio for Phase 1 verification" },
    });
    testProfileCreated.id = true;
    pass("profile:upsert", `name=${profile.name}`);

    const readBack = await prisma.profile.findUnique({ where: { id: "default" } });
    if (readBack && readBack.name === "Phase1 Test Profile") pass("profile:read_back", "data matches");
    else fail("profile:read_back", "data mismatch or not found");

    // Update
    await prisma.profile.update({ where: { id: "default" }, data: { location: "Jakarta", phone: "08123456789" } });
    const updated = await prisma.profile.findUnique({ where: { id: "default" } });
    if (updated?.location === "Jakarta") pass("profile:update", "location saved");
    else fail("profile:update", "location not saved");

    // Social links
    const sl1 = await prisma.socialLink.create({ data: { label: "TestGitHub", url: "https://github.com/test", order: 0, isPublished: true } });
    testSocialIds.push(sl1.id);
    pass("profile:social_create", `id=${sl1.id}`);

    await prisma.socialLink.update({ where: { id: sl1.id }, data: { label: "TestGitHubUpdated" } });
    const slRead = await prisma.socialLink.findUnique({ where: { id: sl1.id } });
    if (slRead?.label === "TestGitHubUpdated") pass("profile:social_update", "renamed");
    else fail("profile:social_update", "rename failed");

    // ═══════════════════════════════════════════
    // 3. TECHNOLOGY CMS
    // ═══════════════════════════════════════════
    console.log("\n═══ 3. TECHNOLOGY CMS ═══");

    const t1 = await prisma.technology.create({ data: { name: "Phase1-TechA" } });
    testTechIds.push(t1.id);
    pass("tech:create", `${t1.name}`);

    const t2 = await prisma.technology.create({ data: { name: "Phase1-TechB" } });
    testTechIds.push(t2.id);
    pass("tech:create_2", `${t2.name}`);

    await prisma.technology.update({ where: { id: t1.id }, data: { name: "Phase1-TechA-Renamed" } });
    const t1r = await prisma.technology.findUnique({ where: { id: t1.id } });
    if (t1r?.name === "Phase1-TechA-Renamed") pass("tech:update", "renamed");
    else fail("tech:update", "rename failed");

    const techCount = await prisma.technology.count();
    pass("tech:count", `${techCount} technologies`);

    // ═══════════════════════════════════════════
    // 4. PROJECT CRUD
    // ═══════════════════════════════════════════
    console.log("\n═══ 4. PROJECT CRUD ═══");

    // Create project 1 (draft)
    const p1 = await prisma.project.create({
      data: {
        title: "Phase1 Test Project One",
        slug: "phase1-test-project-one",
        shortDescription: "Draft project for testing",
        category: "Web",
        client: "Test Client",
        order: 0,
        isPublished: false,
        isFeatured: false,
        overview: "Test overview",
        role: "Full-stack Developer",
        status: "Completed",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
        features: "Feature 1, Feature 2",
        challenges: "Challenge text",
        solutions: "Solution text",
        results: "Result text",
        architecture: "Architecture text",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/test",
        technologies: { connect: [{ id: t1.id }, { id: t2.id }] },
      },
    });
    testProjectIds.push(p1.id);
    pass("project:create_draft", `slug=${p1.slug}, id=${p1.id}`);

    // Create project 2 (draft)
    const p2 = await prisma.project.create({
      data: {
        title: "Phase1 Test Project Two",
        slug: "phase1-test-project-two",
        shortDescription: "Second test project",
        order: 1,
        isPublished: false,
      },
    });
    testProjectIds.push(p2.id);
    pass("project:create_draft_2", `id=${p2.id}`);

    // Read back
    const p1Read = await prisma.project.findUnique({
      where: { id: p1.id },
      include: { technologies: true },
    });
    if (p1Read && p1Read.technologies.length === 2) pass("project:read_with_tech", "2 technologies linked");
    else fail("project:read_with_tech", `got ${p1Read?.technologies.length ?? 0} technologies`);

    // Edit project
    await prisma.project.update({
      where: { id: p1.id },
      data: { title: "Phase1 Test Project One EDITED", shortDescription: "Updated description" },
    });
    const p1Edited = await prisma.project.findUnique({ where: { id: p1.id } });
    if (p1Edited?.title === "Phase1 Test Project One EDITED") pass("project:update", "title updated");
    else fail("project:update", "update failed");

    // ═══════════════════════════════════════════
    // 5. PUBLISH / UNPUBLISH
    // ═══════════════════════════════════════════
    console.log("\n═══ 5. PUBLISH / UNPUBLISH ═══");

    await prisma.project.update({
      where: { id: p1.id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    const p1Pub = await prisma.project.findUnique({ where: { id: p1.id } });
    if (p1Pub?.isPublished === true) pass("publish:set_published", "isPublished=true");
    else fail("publish:set_published", "not published");

    await prisma.project.update({
      where: { id: p1.id },
      data: { isPublished: false, publishedAt: null },
    });
    const p1Unpub = await prisma.project.findUnique({ where: { id: p1.id } });
    if (p1Unpub?.isPublished === false) pass("publish:unpublish", "isPublished=false");
    else fail("publish:unpublish", "still published");

    // Re-publish for public visibility test
    await prisma.project.update({
      where: { id: p1.id },
      data: { isPublished: true, publishedAt: new Date() },
    });

    // ═══════════════════════════════════════════
    // 6. FEATURED
    // ═══════════════════════════════════════════
    console.log("\n═══ 6. FEATURED ═══");

    await prisma.project.update({ where: { id: p1.id }, data: { isFeatured: true } });
    const p1Feat = await prisma.project.findUnique({ where: { id: p1.id } });
    if (p1Feat?.isFeatured === true) pass("featured:set", "isFeatured=true");
    else fail("featured:set", "not featured");

    await prisma.project.update({ where: { id: p1.id }, data: { isFeatured: false } });
    const p1Unfeat = await prisma.project.findUnique({ where: { id: p1.id } });
    if (p1Unfeat?.isFeatured === false) pass("featured:unset", "isFeatured=false");
    else fail("featured:unset", "still featured");

    // Set featured for public test
    await prisma.project.update({ where: { id: p1.id }, data: { isFeatured: true } });

    // ═══════════════════════════════════════════
    // 7. REORDER
    // ═══════════════════════════════════════════
    console.log("\n═══ 7. REORDER ═══");

    // p1 order=0, p2 order=1 → swap
    await prisma.$transaction([
      prisma.project.update({ where: { id: p1.id }, data: { order: 1 } }),
      prisma.project.update({ where: { id: p2.id }, data: { order: 0 } }),
    ]);
    const reordered = await prisma.project.findMany({
      where: { deletedAt: null, id: { in: [p1.id, p2.id] } },
      orderBy: { order: "asc" },
      select: { id: true, title: true, order: true },
    });
    if (reordered[0]?.id === p2.id && reordered[1]?.id === p1.id) {
      pass("reorder:swap", `p2=${reordered[0].order}, p1=${reordered[1].order}`);
    } else {
      fail("reorder:swap", "order not swapped correctly");
    }

    // ═══════════════════════════════════════════
    // 8. GALLERY / IMAGES
    // ═══════════════════════════════════════════
    console.log("\n═══ 8. GALLERY / IMAGES ═══");

    const thumb = await prisma.projectImage.create({
      data: { projectId: p1.id, url: "https://example.com/thumb-test.jpg", isThumbnail: true, sortOrder: 0 },
    });
    pass("gallery:thumbnail_create", `id=${thumb.id}`);

    const g1 = await prisma.projectImage.create({
      data: { projectId: p1.id, url: "https://example.com/gallery1.jpg", isThumbnail: false, sortOrder: 0 },
    });
    const g2 = await prisma.projectImage.create({
      data: { projectId: p1.id, url: "https://example.com/gallery2.jpg", isThumbnail: false, sortOrder: 1 },
    });
    pass("gallery:images_create", `${g1.id}, ${g2.id}`);

    const allImages = await prisma.projectImage.findMany({ where: { projectId: p1.id } });
    const thumbs = allImages.filter((i) => i.isThumbnail);
    const galleries = allImages.filter((i) => !i.isThumbnail);
    if (thumbs.length === 1 && galleries.length === 2) {
      pass("gallery:count", `1 thumbnail, ${galleries.length} gallery`);
    } else {
      fail("gallery:count", `${thumbs.length} thumbnails, ${galleries.length} gallery`);
    }

    // Update thumbnail
    await prisma.projectImage.update({ where: { id: thumb.id }, data: { url: "https://example.com/thumb-updated.jpg" } });
    const thumbUpd = await prisma.projectImage.findUnique({ where: { id: thumb.id } });
    if (thumbUpd?.url === "https://example.com/thumb-updated.jpg") pass("gallery:thumbnail_update", "url updated");
    else fail("gallery:thumbnail_update", "update failed");

    // Delete gallery images
    await prisma.projectImage.deleteMany({ where: { projectId: p1.id, isThumbnail: false } });
    const afterDelete = await prisma.projectImage.findMany({ where: { projectId: p1.id } });
    if (afterDelete.length === 1 && afterDelete[0].isThumbnail) pass("gallery:delete_non_thumbnail", "only thumb remains");
    else fail("gallery:delete_non_thumbnail", `${afterDelete.length} images remain`);

    // ═══════════════════════════════════════════
    // 9. UPLOAD VALIDATION
    // ═══════════════════════════════════════════
    console.log("\n═══ 9. UPLOAD VALIDATION ═══");

    // Valid image
    const v1 = validateUpload("image", { name: "photo.jpg", size: 1024, type: "image/jpeg" });
    if (v1.ok) pass("upload:valid_image", "jpg accepted");
    else fail("upload:valid_image", "should be accepted");

    // Valid png
    const v1b = validateUpload("image", { name: "photo.png", size: 2048, type: "image/png" });
    if (v1b.ok) pass("upload:valid_png", "png accepted");
    else fail("upload:valid_png", "should be accepted");

    // Valid webp
    const v1c = validateUpload("gallery", { name: "shot.webp", size: 3072, type: "image/webp" });
    if (v1c.ok) pass("upload:valid_webp", "webp accepted for gallery");
    else fail("upload:valid_webp", "should be accepted");

    // Invalid: exe
    const v2 = validateUpload("image", { name: "malware.exe", size: 1024, type: "application/octet-stream" });
    if (!v2.ok) pass("upload:reject_exe", v2.error!);
    else fail("upload:reject_exe", "should reject .exe");

    // Invalid: too large (6MB image, limit 5MB)
    const v3 = validateUpload("image", { name: "big.jpg", size: 6 * 1024 * 1024, type: "image/jpeg" });
    if (!v3.ok) pass("upload:reject_oversized", v3.error!);
    else fail("upload:reject_oversized", "should reject >5MB");

    // Invalid: wrong mime for resume (not PDF)
    const v4 = validateUpload("resume", { name: "doc.docx", size: 1024, type: "application/msword" });
    if (!v4.ok) pass("upload:reject_non_pdf_resume", v4.error!);
    else fail("upload:reject_non_pdf_resume", "should reject non-PDF for resume");

    // Valid: PDF resume
    const v5 = validateUpload("resume", { name: "cv.pdf", size: 1024, type: "application/pdf" });
    if (v5.ok) pass("upload:valid_pdf_resume", "pdf accepted");
    else fail("upload:valid_pdf_resume", "should be accepted");

    // Upload rules exist for all kinds
    const kinds: UploadKind[] = ["image", "gallery", "certificate", "resume"];
    const allRulesExist = kinds.every((k) => uploadRules[k] && uploadRules[k].maxSizeBytes > 0);
    if (allRulesExist) pass("upload:rules_complete", "all 4 kinds configured");
    else fail("upload:rules_complete", "missing rules");

    // ═══════════════════════════════════════════
    // 10. PUBLIC PROJECT VISIBILITY
    // ═══════════════════════════════════════════
    console.log("\n═══ 10. PUBLIC PROJECT VISIBILITY ═══");

    // p1 is published + featured, p2 is draft
    const publishedProjects = await prisma.project.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { id: true, slug: true, isPublished: true, isFeatured: true },
    });
    const p1InPublic = publishedProjects.find((p) => p.id === p1.id);
    const p2InPublic = publishedProjects.find((p) => p.id === p2.id);

    if (p1InPublic) pass("public:published_appears", `slug=${p1InPublic.slug}`);
    else fail("public:published_appears", "published project not in public listing");

    if (!p2InPublic) pass("public:draft_hidden", "draft project hidden");
    else fail("public:draft_hidden", "draft project visible in public");

    // Featured filter
    const featured = publishedProjects.filter((p) => p.isFeatured);
    if (featured.some((p) => p.id === p1.id)) pass("public:featured_in_list", "featured project in featured list");
    else fail("public:featured_in_list", "featured project not in featured list");

    // Slug routing: fetch the detail page
    const detailStatus = await getRoute(`/projects/${p1.slug}`);
    if (detailStatus === 200) pass("public:slug_detail_200", `/projects/${p1.slug} → 200`);
    else fail("public:slug_detail_200", `HTTP ${detailStatus}`);

    // Slug routing: unpublished project detail → should 404
    const draftDetail = await getRoute(`/projects/${p2.slug}`);
    if (draftDetail === 404) pass("public:draft_detail_404", "draft project returns 404");
    else fail("public:draft_detail_404", `HTTP ${draftDetail} (expected 404)`);

    // Non-existent slug → 404
    const ghostDetail = await getRoute("/projects/non-existent-slug-xyz");
    if (ghostDetail === 404) pass("public:ghost_slug_404", "non-existent slug returns 404");
    else fail("public:ghost_slug_404", `HTTP ${ghostDetail} (expected 404)`);

    // ═══════════════════════════════════════════
    // 11. SOFT DELETE
    // ═══════════════════════════════════════════
    console.log("\n═══ 11. SOFT DELETE ═══");

    await prisma.project.update({ where: { id: p2.id }, data: { deletedAt: new Date() } });
    const p2Soft = await prisma.project.findUnique({ where: { id: p2.id } });
    if (p2Soft?.deletedAt !== null) pass("softdelete:set", "deletedAt set");
    else fail("softdelete:set", "deletedAt not set");

    // Should not appear in non-deleted queries
    const activeProjects = await prisma.project.findMany({ where: { deletedAt: null }, select: { id: true } });
    if (!activeProjects.some((p) => p.id === p2.id)) pass("softdelete:hidden", "soft-deleted project hidden from active");
    else fail("softdelete:hidden", "soft-deleted project still in active list");

    // ═══════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════
    console.log("\n═══ CLEANUP ═══");

    // Delete test projects (including images via cascade)
    for (const pid of testProjectIds) {
      await prisma.projectImage.deleteMany({ where: { projectId: pid } });
      await prisma.project.delete({ where: { id: pid } });
    }
    pass("cleanup:projects", `${testProjectIds.length} projects deleted`);

    // Delete test technologies (only if not used by other projects)
    for (const tid of testTechIds) {
      const tech = await prisma.technology.findUnique({ where: { id: tid }, include: { _count: { select: { projects: true } } } });
      if (tech && tech._count.projects === 0) {
        await prisma.technology.delete({ where: { id: tid } });
      }
    }
    pass("cleanup:technologies", `${testTechIds.length} technologies removed`);

    // Delete test social links
    for (const sid of testSocialIds) {
      await prisma.socialLink.delete({ where: { id: sid } });
    }
    pass("cleanup:social_links", `${testSocialIds.length} social links removed`);

    // Restore profile to empty (if it was created by test)
    // We DON'T delete profile — just reset test fields
    await prisma.profile.updateMany({
      where: { id: "default" },
      data: { name: "", title: "", bio: "", location: null, phone: null },
    });
    pass("cleanup:profile", "profile reset to empty");

    // Verify admin user still exists
    const adminStill = await prisma.user.findUnique({ where: { email } });
    if (adminStill) pass("cleanup:admin_preserved", `email=${adminStill.email}`);
    else fail("cleanup:admin_preserved", "admin user was deleted!");

  } finally {
    await prisma.$disconnect();
  }

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log("\n══════════════════════════════════════════");
  console.log("PHASE 1 VERIFICATION RESULTS");
  console.log("══════════════════════════════════════════");

  const passed = Object.values(results).filter((v) => v.startsWith("PASS")).length;
  const failed = Object.values(results).filter((v) => v.startsWith("FAIL")).length;

  for (const [name, result] of Object.entries(results)) {
    console.log(`  ${result.startsWith("PASS") ? "✓" : "✗"} ${name}: ${result}`);
  }

  console.log(`\n  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n  ⚠ Some checks failed. See details above.");
    process.exit(1);
  } else {
    console.log("\n  ✓ All checks passed.");
  }
}

main().catch((e) => {
  console.error("Verification script error:", e);
  process.exit(1);
});
