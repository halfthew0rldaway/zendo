"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/projects", icon: "grid_view", label: "Projects", exact: true, fill: true },
    { href: "/projects/board", icon: "view_kanban", label: "Board", fill: true },
    { href: "/projects/schedule", icon: "calendar_month", label: "Schedule", fill: true },
    { href: "/projects/analytics", icon: "monitoring", label: "Analytics", fill: true },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === "/projects" || /^\/projects\/(?!board|schedule|analytics|new)[^/]/.test(pathname);
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/20 px-4 py-2 flex items-center justify-between z-50 flex-row" style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.05)" }}>
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-all ${
              active ? "text-primary bg-primary-container" : "text-on-surface-variant hover:bg-surface hover:text-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined transition-all ${active ? "text-[24px]" : "text-[22px]"}`}
              style={active && item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
