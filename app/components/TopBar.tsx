"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useProjects } from "../lib/store";

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const { projects } = useProjects();
  const ref = useRef<HTMLDivElement>(null);

  // Derive recent activity from tasks sorted by updatedAt
  const activities = projects
    .flatMap((p) =>
      p.tasks.map((t) => ({
        projectName: p.name,
        projectId: p.id,
        taskTitle: t.title,
        assigneeName: t.assigneeName,
        assigneeInitials: t.assigneeInitials,
        status: t.status,
        updatedAt: t.updatedAt,
      }))
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const STATUS_LABELS: Record<string, string> = {
    todo: "added to To Do",
    in_progress: "moved to In Progress",
    review: "sent to Review",
    testing: "sent to Testing",
    done: "marked as Done",
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-[#abb3b7]/20 z-50 overflow-hidden"
      style={{ boxShadow: "0 16px 40px rgba(43,52,55,0.12)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f4f6]">
        <h3 className="font-bold text-[#2b3437] text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
          Notifications
        </h3>
        <span className="text-[10px] font-bold bg-[#0c56d0] text-white px-2 py-0.5 rounded-full">
          {activities.length}
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="py-12 text-center text-[#737c7f] text-sm">
          <span className="material-symbols-outlined text-3xl block mb-2 text-[#abb3b7]">notifications_none</span>
          No recent activity
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto hide-scrollbar">
          {activities.map((act, i) => (
            <Link
              key={i}
              href={`/projects/${act.projectId}/board`}
              onClick={onClose}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#f1f4f6] transition-colors border-b border-[#f1f4f6] last:border-0"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: "#0c56d0" }}
              >
                {act.assigneeInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#2b3437] leading-snug">
                  <span className="font-bold">{act.assigneeName}</span>{" "}
                  <span className="text-[#586064]">{STATUS_LABELS[act.status] ?? "updated"}</span>{" "}
                  <span className="font-medium text-[#0c56d0] truncate">{act.taskTitle}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#737c7f]">{act.projectName}</span>
                  <span className="w-1 h-1 bg-[#abb3b7] rounded-full" />
                  <span className="text-[10px] text-[#737c7f]">{formatTime(act.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="px-5 py-3 border-t border-[#f1f4f6]">
        <button className="text-xs font-bold text-[#0c56d0] hover:underline" onClick={onClose}>
          Mark all as read
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { resetData } = useProjects();
  const ref = useRef<HTMLDivElement>(null);
  const [appName, setAppName] = useState("Zendo");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleExport = () => {
    try {
      const data = {
        projects: JSON.parse(localStorage.getItem("architect_projects") || "[]"),
        members: JSON.parse(localStorage.getItem("architect_members") || "[]"),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `architect-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#abb3b7]/20 z-50"
      style={{ boxShadow: "0 16px 40px rgba(43,52,55,0.12)" }}
    >
      <div className="px-5 py-4 border-b border-[#f1f4f6]">
        <h3 className="font-bold text-[#2b3437] text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
          Settings
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* App Name */}
        <div>
          <label className="text-[10px] font-bold text-[#586064] uppercase tracking-widest block mb-2">
            Workspace Name
          </label>
          <input
            className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:border-[#0c56d0]/40 focus:bg-white transition-all"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
        </div>

        {/* Data Management */}
        <div>
          <label className="text-[10px] font-bold text-[#586064] uppercase tracking-widest block mb-3">
            Data Management
          </label>
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f1f4f6] hover:bg-[#e3e9ec] text-sm font-medium text-[#2b3437] transition-colors active:scale-95"
              onClick={handleExport}
            >
              <span className="material-symbols-outlined text-lg text-[#0c56d0]">download</span>
              Export data as JSON
            </button>
            {!confirmReset ? (
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f1f4f6] hover:bg-[#fe8983]/20 text-sm font-medium text-[#586064] hover:text-[#9f403d] transition-colors active:scale-95"
                onClick={() => setConfirmReset(true)}
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                Reset to defaults
              </button>
            ) : (
              <div className="bg-[#fe8983]/10 border border-[#fe8983]/30 rounded-lg p-3">
                <p className="text-xs text-[#9f403d] font-medium mb-3">This will erase all your data. Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-1.5 rounded-lg bg-[#9f403d] text-white text-xs font-bold active:scale-95 transition-all"
                    onClick={() => { resetData(); setConfirmReset(false); onClose(); }}
                  >
                    Yes, reset
                  </button>
                  <button
                    className="flex-1 py-1.5 rounded-lg bg-[#e3e9ec] text-[#586064] text-xs font-bold"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="pt-2 border-t border-[#f1f4f6]">
          <div className="flex items-center justify-between text-[10px] text-[#737c7f]">
            <span className="uppercase tracking-widest font-bold">Version</span>
            <span>1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopBar({ showSearch = true, searchPlaceholder = "Search projects..." }: { showSearch?: boolean; searchPlaceholder?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, currentUserId, currentProfile } = useProjects();
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close avatar menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Derive initials from profile fallback to userId
  const nameToUse = currentProfile?.fullName || currentProfile?.username || currentUserId?.slice(0, 8);
  const initials = currentProfile?.fullName 
    ? currentProfile.fullName.slice(0, 2).toUpperCase()
    : currentProfile?.username 
      ? currentProfile.username.slice(0, 2).toUpperCase()
      : currentUserId ? currentUserId.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="bg-[#f8f9fa] flex justify-between items-center w-full px-10 py-4 sticky top-0 z-40 border-b border-slate-100">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-black tracking-tighter text-[#0c56d0] opacity-0 pointer-events-none" style={{ fontFamily: "Outfit, sans-serif" }}>
          ZENDO
        </span>
        <nav className="hidden md:flex gap-6">
          <Link href="/projects" className={`font-medium transition-all duration-300 text-sm ${pathname === "/projects" ? "text-[#0c56d0] font-bold border-b-2 border-[#0c56d0] pb-1" : "text-slate-500 hover:text-[#0c56d0]"}`}>
            Projects
          </Link>
          <Link href="/projects/board" className={`font-medium transition-all duration-300 text-sm ${pathname.startsWith("/projects/board") || /^\/projects\/[^/]+\/board/.test(pathname) ? "text-[#0c56d0] font-bold border-b-2 border-[#0c56d0] pb-1" : "text-slate-500 hover:text-[#0c56d0]"}`}>
            Kanban
          </Link>
          <Link href="/projects/schedule" className={`font-medium transition-all duration-300 text-sm ${pathname.startsWith("/projects/schedule") ? "text-[#0c56d0] font-bold border-b-2 border-[#0c56d0] pb-1" : "text-slate-500 hover:text-[#0c56d0]"}`}>
            Schedule
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737c7f] text-[20px]">search</span>
            <input
              className="bg-[#f1f4f6] border border-transparent rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-[#0c56d0]/20 text-sm outline-none transition-all focus:bg-white focus:w-80"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative">
            <button
              className={`p-2 rounded-full transition-colors active:scale-95 ${notifOpen ? "bg-[#dae2ff] text-[#0c56d0]" : "text-slate-500 hover:bg-[#eaeff1]"}`}
              onClick={() => { setNotifOpen((v) => !v); setSettingsOpen(false); }}
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              className={`p-2 rounded-full transition-colors active:scale-95 ${settingsOpen ? "bg-[#dae2ff] text-[#0c56d0]" : "text-slate-500 hover:bg-[#eaeff1]"}`}
              onClick={() => { setSettingsOpen((v) => !v); setNotifOpen(false); }}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
          </div>

          {/* Avatar + sign out */}
          <div ref={avatarRef} className="relative ml-1">
            <button
              className="w-8 h-8 rounded-full bg-[#0c56d0] flex items-center justify-center text-white text-xs font-bold active:scale-95 transition-transform shadow-sm"
              onClick={() => setAvatarOpen(v => !v)}
            >
              {initials}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#abb3b7]/20 overflow-hidden z-50 min-w-[160px]">
                <div className="px-4 py-3 border-b border-[#f1f4f6]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#737c7f]">Signed in</p>
                  <p className="text-xs text-[#2b3437] font-medium truncate">{nameToUse}</p>
                </div>
                <button
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#9f403d] hover:bg-[#fe8983]/10 transition-colors font-semibold"
                  onClick={handleSignOut}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
