"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "../../lib/store";
import { Project } from "../../types";
import { formatDistanceToNow } from "../../lib/utils";

const ICON_BG_MAP = {
  primary: "bg-[#dae2ff] text-[#0c56d0]",
  secondary: "bg-[#cfe6f2] text-[#4d626c]",
  tertiary: "bg-[#e3dbfd] text-[#615b77]",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-[#e3e9ec] text-[#586064]",
  in_progress: "bg-[#dae2ff] text-[#004ab9]",
  review: "bg-[#cfe6f2] text-[#40555f]",
  testing: "bg-[#f1f4f6] text-[#586064]",
  done: "bg-[#cfe6f2] text-[#2d424c]",
};

function BoardProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const { unlockedProjectIds } = useProjects();
  const isLocked = project.pin !== null && !unlockedProjectIds.has(project.id);

  const taskCounts = {
    todo: project.tasks.filter((t) => t.status === "todo").length,
    in_progress: project.tasks.filter((t) => t.status === "in_progress").length,
    done: project.tasks.filter((t) => t.status === "done").length,
  };

  const handleOpen = () => {
    if (isLocked) router.push(`/projects/${project.id}/pin`);
    else router.push(`/projects/${project.id}/board`);
  };

  return (
    <div className="bg-white rounded-xl p-6 ghost-border hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${ICON_BG_MAP[project.iconBg]}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {project.icon}
          </span>
        </div>
        {isLocked && (
          <span className="material-symbols-outlined text-[#737c7f] text-lg">lock</span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-xl text-[#2b3437] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
          {project.name}
        </h3>
        <p className="text-[#586064] text-sm line-clamp-2">{project.description}</p>
      </div>

      {/* Task breakdown */}
      <div className="flex gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${STATUS_COLORS.todo}`}>
          {taskCounts.todo} to do
        </span>
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${STATUS_COLORS.in_progress}`}>
          {taskCounts.in_progress} in progress
        </span>
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${STATUS_COLORS.done}`}>
          {taskCounts.done} done
        </span>
      </div>

      {/* Progress bar */}
      {project.tasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#737c7f] font-bold">
            <span>Progress</span>
            <span>{Math.round((taskCounts.done / project.tasks.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-[#e3e9ec] rounded-full">
            <div
              className="h-1.5 bg-[#0c56d0] rounded-full transition-all"
              style={{ width: `${(taskCounts.done / project.tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[#f1f4f6] flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#737c7f] uppercase tracking-wider">
          {formatDistanceToNow(new Date(project.updatedAt))}
        </span>
        <button
          onClick={handleOpen}
          className="primary-gradient text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 active:scale-95 transition-all"
        >
          {isLocked ? (
            <><span className="material-symbols-outlined text-sm">lock</span> Unlock</>
          ) : (
            <><span className="material-symbols-outlined text-sm">view_kanban</span> Open Board</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BoardSelectorClient() {
  const { projects } = useProjects();

  return (
    <div className="px-10 py-10 flex-grow">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          Kanban Boards
        </h1>
        <p className="text-[#4d626c] text-base max-w-md">
          Select a project to view and manage its task board.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-5xl text-[#abb3b7]">view_kanban</span>
          <p className="text-[#586064] font-medium">No projects yet.</p>
          <Link href="/projects/new" className="primary-gradient text-white px-6 py-3 rounded-full font-bold text-sm">
            Create a Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <BoardProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
