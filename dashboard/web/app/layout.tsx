import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "career-ops",
  description: "Local dashboard for the career-ops AI job-search pipeline",
};

function deriveNav(pathname: string) {
  return [
    { href: "/",         label: "Today",    active: pathname === "/",                    enabled: true  },
    { href: "/pipeline", label: "Pipeline", active: pathname.startsWith("/pipeline"),    enabled: true  },
    { href: "#",         label: "Reports",  active: false,                               enabled: false },
    { href: "#",         label: "Settings", active: false,                               enabled: false },
  ];
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next 15 exposes the request path via the x-invoke-path / x-pathname header in
  // App Router. Fall back to "/" if unavailable so SSG/build-time still renders.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "/";

  const navItems = deriveNav(pathname);

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Sidebar items={navItems} />
          <main className="flex-1 p-3xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
