"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/projects", icon: "grid_view", label: "Projects", exact: true, fill: true },
    { href: "/projects/board", icon: "view_kanban", label: "Board", fill: true },
    { href: "/projects/schedule", icon: "calendar_month", label: "Calendar", fill: true },
    { href: "/projects/analytics", icon: "monitoring", label: "Analytics", fill: true },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === "/projects" || /^\/projects\/(?!board|schedule|analytics|new)[^/]/.test(pathname);
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className={`h-screen sticky top-0 left-0 w-64 bg-surface-container-low flex-col gap-8 p-6 z-50 shrink-0 border-r border-outline-variant/20 ${className || "flex"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            architecture
          </span>
        </div>
        <div>
          <div className="font-bold text-lg text-on-surface tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            ZENDO
          </div>
        </div>
      </div>

      {/* Create New Button */}
      <Link
        href="/projects/new"
        className="primary-gradient text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
        style={{ boxShadow: "0 8px 24px rgba(12,86,208,0.2)" }}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Create New
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "text-primary font-bold bg-surface-container-lowest shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-lowest"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active && item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="pt-6 mt-auto border-t border-outline-variant/20 flex flex-col gap-1">
        <Link
          href="/projects/help"
          className={`flex items-center gap-3 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${pathname === "/projects/help" ? "text-primary bg-surface-container-lowest" : "text-on-surface-variant hover:bg-surface-container-lowest"}`}
        >
          <span className="material-symbols-outlined">help</span>
          Help
        </Link>
        <Link
          href="/projects/archived"
          className={`flex items-center gap-3 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${pathname === "/projects/archived" ? "text-primary bg-surface-container-lowest" : "text-on-surface-variant hover:bg-surface-container-lowest"}`}
        >
          <span className="material-symbols-outlined">archive</span>
          Archived
        </Link>
      </div>
    </aside>
  );
}
