import { ProfileForm } from "@/components/admin/forms/profile-form";
import { SocialLinksManager } from "@/components/admin/forms/social-links-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Profile" };

export default async function AdminProfilePage() {
  const profile = await prisma.profile.findFirst({ orderBy: { createdAt: "asc" } });
  const links = await prisma.socialLink.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your name, bio, contact info, and downloadable resume.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-5 font-display text-lg font-semibold">
          Profile details
        </h2>
        <ProfileForm profile={profile} />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-5 font-display text-lg font-semibold">
          Social links
        </h2>
        <SocialLinksManager links={links} />
      </section>
    </div>
  );
}