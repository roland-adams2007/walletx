"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import "./settings.css";

const tabs = [
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/account", label: "Account" },
  { href: "/dashboard/settings/preferences", label: "Preferences" },
  { href: "/dashboard/settings/api_keys", label: "Webhook & API" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="px-2 md:px-6 lg:px-10 max-w-3xl">
      <div
        className="flex overflow-x-auto no-scrollbar"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab-btn whitespace-nowrap ${pathname === tab.href ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </main>
  );
}