import Link from "next/link";

import { Logo } from "@/components/site/logo";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getPublishedSocialLinks } from "@/lib/queries";
import { getPublicProfile } from "@/lib/queries";

export async function SiteFooter() {
  const [profile, socialLinks] = await Promise.all([
    getPublicProfile(),
    getPublishedSocialLinks(),
  ]);

  const displayName = profile?.name?.trim() ? profile.name.trim() : siteConfig.author;
  const identity =
    profile?.title?.trim()
      ? profile.title.trim()
      : siteConfig.tagline;

  return (
    <footer className="mt-auto border-t border-line/70 bg-surface">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{identity}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted/80">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="tech-label text-muted">Navigate</p>
            <ul className="mt-4 grid gap-y-2.5">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.95rem] text-ink-soft transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {socialLinks.length > 0 && (
            <div>
              <p className="tech-label text-muted">Elsewhere</p>
              <ul className="mt-4 grid gap-y-2.5">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-[0.95rem] text-ink-soft transition-colors hover:text-primary"
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className="text-primary opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ↑
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {displayName}
          </p>
          <p className="text-sm text-muted/80">{siteConfig.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
