export const siteConfig = {
  name: "Syarfani Akbar",
  shortName: "SA",
  author: "Syarfani Akbar",
  tagline: "IT Infrastructure & Innovation",
  description:
    "Personal portfolio of Syarfani Akbar — IT infrastructure engineer and innovation partner.",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Experience", href: "/experience" },
    { label: "Projects", href: "/projects" },
    { label: "Skills", href: "/skills" },
    { label: "Certificates", href: "/certificates" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;