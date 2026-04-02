"use client";

import { useRouter } from "next/navigation";
import { useProjects } from "../../lib/store";
import { formatDistanceToNow } from "../../lib/utils";

const ICON_BG_MAP = {
  primary: "bg-[#dae2ff] text-[#0c56d0]",
  secondary: "bg-[#cfe6f2] text-[#4d626c]",
  tertiary: "bg-[#e3dbfd] text-[#615b77]",
};

export default function ArchivedClient() {
  const { projects } = useProjects();
  const router = useRouter();

  // Show projects where all tasks are done or there are no tasks
  const archivedProjects = projects.filter(
    (p) => p.tasks.length > 0 && p.tasks.every((t) => t.status === "done")
  );

  return (
    <div className="px-5 py-6 md:px-10 md:py-10 flex-grow">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          Archived
        </h1>
        <p className="text-[#4d626c] text-base">
          Projects where all tasks have been completed.
        </p>
      </div>

      {archivedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-5xl text-[#abb3b7]">archive</span>
          <p className="font-bold text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>No archived projects yet</p>
          <p className="text-sm text-[#586064]">Projects appear here once all their tasks are marked done.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-xl ghost-border opacity-80 hover:opacity-100 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push(`/projects/${project.id}/board`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${ICON_BG_MAP[project.iconBg]}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {project.icon}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#cfe6f2] text-[#2d424c] text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Completed
                </span>
              </div>
              <h3 className="font-bold text-xl text-[#2b3437] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {project.name}
              </h3>
              <p className="text-[#586064] text-sm line-clamp-2 mb-4">{project.description}</p>
              <div className="pt-4 border-t border-[#f1f4f6] flex justify-between items-center">
                <span className="text-xs text-[#737c7f] font-medium">{project.tasks.length} tasks completed</span>
                <span className="text-[11px] font-bold text-[#737c7f] uppercase tracking-wider">
                  {formatDistanceToNow(new Date(project.updatedAt))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
