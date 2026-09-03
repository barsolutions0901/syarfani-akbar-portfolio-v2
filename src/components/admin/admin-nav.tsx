"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/auth.client";

type NavLink = { label: string; href: string };

export function AdminNav({
  links,
  userEmail,
}: {
  links: NavLink[];
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      <p className="px-3 pb-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
        Content
      </p>
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary-soft text-primary-deep"
                : "text-muted hover:bg-ink/5 hover:text-ink",
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur-md lg:hidden">
        <Logo />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink"
          aria-label={open ? "Close admin menu" : "Open admin menu"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <path d="M4 4l10 10" />
                <path d="M14 4L4 14" />
              </>
            ) : (
              <>
                <path d="M2 5h14" />
                <path d="M2 9h14" />
                <path d="M2 13h14" />
              </>
            )}
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          id="admin-sidebar"
          className="fixed inset-0 z-40 bg-paper px-4 pb-6 pt-3 lg:hidden"
        >
          {nav}
          <div className="mt-6 border-t border-line pt-4">
            <p className="mb-3 truncate px-3 font-mono text-xs text-muted">
              {userEmail}
            </p>
            <button
              type="button"
              onClick={() => signOut({ redirectTo: "/" })}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface p-4 lg:flex">
        <div className="mb-6 px-1">
          <Logo />
        </div>
        {nav}
        <div className="mt-auto border-t border-line pt-4">
          <p className="mb-3 truncate px-3 font-mono text-xs text-muted">
            {userEmail}
          </p>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile: content padding */}
      <div className="lg:hidden" aria-hidden />
    </>
  );
}