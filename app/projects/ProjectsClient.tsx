"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "../lib/store";
import { Project } from "../types";
import { formatDistanceToNow } from "../lib/utils";

const ICON_BG_MAP = {
  primary: "bg-[#dae2ff] text-[#0c56d0]",
  secondary: "bg-[#cfe6f2] text-[#4d626c]",
  tertiary: "bg-[#e3dbfd] text-[#615b77]",
};

type FilterValue = "all" | "locked" | "unlocked";
type SortValue = "newest" | "oldest" | "name_asc" | "name_z" | "tasks";

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const { unlockedProjectIds, deleteProject } = useProjects();
  const isLocked = project.pin !== null && !unlockedProjectIds.has(project.id);

  const handleClick = () => {
    if (isLocked) router.push(`/projects/${project.id}/pin`);
    else router.push(`/projects/${project.id}/board`);
  };

  const doneTasks = project.tasks.filter((t) => t.status === "done").length;
  const progress = project.tasks.length > 0 ? Math.round((doneTasks / project.tasks.length) * 100) : 0;

  return (
    <div
      className="group bg-white p-6 rounded-xl ghost-border hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${ICON_BG_MAP[project.iconBg]}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {project.icon}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fe8983]/20 rounded text-[#737c7f] hover:text-[#9f403d]"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                deleteProject(project.id);
              }
            }}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
          <span
            className={`material-symbols-outlined transition-colors ${isLocked ? "text-[#737c7f] group-hover:text-[#0c56d0]" : "text-[#abb3b7]"}`}
            title={isLocked ? "PIN Protected" : "Open"}
          >
            {isLocked ? "lock" : "lock_open"}
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xl text-[#2b3437] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
          {project.name}
        </h3>
        <p className="text-[#586064] text-sm line-clamp-2">{project.description}</p>
      </div>

      {/* Progress */}
      {project.tasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#737c7f] font-semibold">
            <span>{project.tasks.length} tasks</span>
            <span>{progress}% done</span>
          </div>
          <div className="h-1 bg-[#e3e9ec] rounded-full">
            <div className="h-1 bg-[#0c56d0] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-2 pt-4 border-t border-[#eaeff1] flex items-center justify-between">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(project.memberCount, 2) }).map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-[#0c56d0] flex items-center justify-center text-white text-[9px] font-bold">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {project.memberCount > 2 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-[#dbe4e7] text-[10px] flex items-center justify-center font-bold text-[#586064]">
              +{project.memberCount - 2}
            </div>
          )}
        </div>
        <span className="text-[11px] font-bold text-[#737c7f] uppercase tracking-wider">
          {formatDistanceToNow(new Date(project.updatedAt))}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-[#e3e9ec] flex items-center justify-center text-[#737c7f]">
        <span className="material-symbols-outlined text-4xl">folder_open</span>
      </div>
      <div className="text-center">
        <p className="font-bold text-[#2b3437] text-lg mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>No Projects Yet</p>
        <p className="text-sm text-[#586064]">Create your first project to get started.</p>
      </div>
      <Link href="/projects/new" className="primary-gradient text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg active:scale-95 transition-transform">
        Create Project
      </Link>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, unlockedProjectIds } = useProjects();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const FILTER_LABELS: Record<FilterValue, string> = { all: "All", locked: "Locked", unlocked: "Open" };
  const SORT_LABELS: Record<SortValue, string> = { newest: "Newest", oldest: "Oldest", name_asc: "Name A–Z", name_z: "Name Z–A", tasks: "Most Tasks" };

  const filtered = useMemo(() => {
    let result = [...projects];
    if (filter === "locked") result = result.filter((p) => p.pin && !unlockedProjectIds.has(p.id));
    if (filter === "unlocked") result = result.filter((p) => !p.pin || unlockedProjectIds.has(p.id));
    switch (sort) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "name_asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_z": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "tasks": result.sort((a, b) => b.tasks.length - a.tasks.length); break;
    }
    return result;
  }, [projects, filter, sort, unlockedProjectIds]);

  return (
    <div className="px-10 py-10 flex-grow">
      {/* Header */}
      <div className="mb-10 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Projects
          </h1>
          <p className="text-[#4d626c] text-base max-w-md">
            Manage your architectural blueprints and development pipelines with precision.
          </p>
        </div>
        <div className="flex gap-3 relative">
          {/* Filter */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${filter !== "all" ? "bg-[#dae2ff] text-[#0c56d0]" : "bg-[#e3e9ec] text-[#40555f] hover:bg-[#dbe4e7]"}`}
              onClick={() => { setShowFilterMenu((v) => !v); setShowSortMenu(false); }}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              {FILTER_LABELS[filter]}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#abb3b7]/20 overflow-hidden z-20 min-w-[140px]">
                {(Object.keys(FILTER_LABELS) as FilterValue[]).map((v) => (
                  <button
                    key={v}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f1f4f6] transition-colors flex items-center justify-between ${filter === v ? "font-bold text-[#0c56d0]" : "text-[#2b3437]"}`}
                    onClick={() => { setFilter(v); setShowFilterMenu(false); }}
                  >
                    {FILTER_LABELS[v]}
                    {filter === v && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${sort !== "newest" ? "bg-[#dae2ff] text-[#0c56d0]" : "bg-[#e3e9ec] text-[#40555f] hover:bg-[#dbe4e7]"}`}
              onClick={() => { setShowSortMenu((v) => !v); setShowFilterMenu(false); }}
            >
              <span className="material-symbols-outlined text-[18px]">sort</span>
              {SORT_LABELS[sort]}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#abb3b7]/20 overflow-hidden z-20 min-w-[160px]">
                {(Object.keys(SORT_LABELS) as SortValue[]).map((v) => (
                  <button
                    key={v}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f1f4f6] transition-colors flex items-center justify-between ${sort === v ? "font-bold text-[#0c56d0]" : "text-[#2b3437]"}`}
                    onClick={() => { setSort(v); setShowSortMenu(false); }}
                  >
                    {SORT_LABELS[v]}
                    {sort === v && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {projects.length > 0 && (
        <p className="text-xs font-medium text-[#737c7f] mb-4">
          {filtered.length} of {projects.length} projects
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <Link
              href="/projects/new"
              className="border-2 border-dashed border-[#abb3b7]/30 rounded-xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-[#f1f4f6] transition-colors min-h-[220px]"
            >
              <div className="w-14 h-14 rounded-full bg-[#e3e9ec] flex items-center justify-center text-[#737c7f] group-hover:bg-[#dae2ff] group-hover:text-[#0c56d0] transition-all">
                <span className="material-symbols-outlined text-[32px]">add_circle</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-lg text-[#586064]" style={{ fontFamily: "Manrope, sans-serif" }}>New Canvas</span>
                <span className="text-xs text-[#737c7f]">Start from a template or blank</span>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/projects/new"
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full primary-gradient text-white flex items-center justify-center active:scale-90 transition-transform group z-50"
        style={{ boxShadow: "0 16px 40px rgba(12,86,208,0.4)" }}
      >
        <span className="material-symbols-outlined text-[32px]">add</span>
        <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Start New Project
        </span>
      </Link>
    </div>
  );
}
