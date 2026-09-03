import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight } from "@/components/icons/arrows";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { getPublicProfile } from "@/lib/queries";
import { getPublishedSocialLinks } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Syarfani Akbar about projects, infrastructure, or software.",
};

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([
    getPublicProfile(),
    getPublishedSocialLinks(),
  ]);

  const hasContent =
    profile?.email || profile?.phone || profile?.whatsapp || socialLinks.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let&apos;s talk."
        intro="Have a project, an infrastructure challenge, or just a good idea? Reach out — I usually answer quickly."
      />

      <Container className="pb-24 pt-8">
        {!hasContent && (
          <EmptyState title="No contact details yet">
            Contact information will appear here once it is added in the admin
            panel.
          </EmptyState>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          <div className="space-y-4">
            {profile?.email && (
              <ContactRow label="Email" href={`mailto:${profile.email}`}>
                {profile.email}
              </ContactRow>
            )}
            {profile?.phone && (
              <ContactRow label="Phone" href={`tel:${profile.phone}`}>
                {profile.phone}
              </ContactRow>
            )}
            {profile?.whatsapp && (
              <ContactRow
                label="WhatsApp"
                href={`https://wa.me/${normalizePhone(profile.whatsapp)}`}
              >
                {profile.whatsapp}
              </ContactRow>
            )}
            {profile?.location && (
              <div className="flex items-start gap-4 rounded-3xl border border-line/70 bg-surface p-5">
                <Label>Location</Label>
                <span className="pt-1 text-ink-soft">{profile.location}</span>
              </div>
            )}
          </div>

          <div>
            {socialLinks.length > 0 && (
              <div>
                <p className="text-[0.8rem] font-bold text-primary">Elsewhere</p>
                <ul className="mt-4 grid gap-2">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-3xl border border-line/70 bg-surface px-5 py-4 transition-colors hover:border-primary/50"
                      >
                        <span className="font-medium">{link.label}</span>
                        <ArrowUpRight className="size-4 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

function ContactRow({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-3xl border border-line/70 bg-surface p-5 transition-colors hover:border-primary/50"
    >
      <Label className="pt-1">{label}</Label>
      <span className="font-medium text-ink-soft underline-offset-2 hover:text-primary hover:underline">
        {children}
      </span>
    </Link>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`tech-label w-24 shrink-0 text-muted ${className ?? ""}`}>
      {children}
    </span>
  );
}

function normalizePhone(value: string): string {
  return value.replace(/[^+\d]/g, "");
}
