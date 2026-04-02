"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects } from "../../lib/store";
import { Task, TaskStatus, Priority } from "../../types";

const COLUMNS: { id: TaskStatus; title: string; icon: string }[] = [
  { id: "todo", title: "To Do", icon: "radio_button_unchecked" },
  { id: "in_progress", title: "In Progress", icon: "pending" },
  { id: "review", title: "Review", icon: "rate_review" },
  { id: "testing", title: "Testing", icon: "bug_report" },
  { id: "done", title: "Done", icon: "check_circle" },
];

const PRIORITY_MAP: Record<Priority, { label: string; color: string; icon: string }> = {
  urgent: { label: "Urgent", color: "text-[#9f403d]", icon: "priority_high" },
  high: { label: "High", color: "text-[#9f403d]", icon: "arrow_upward" },
  medium: { label: "Medium", color: "text-[#0c56d0]", icon: "schedule" },
  low: { label: "Low", color: "text-[#4d626c]", icon: "low_priority" },
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; icon: string }> = {
  todo: { bg: "bg-[#e3e9ec]", text: "text-[#586064]", icon: "radio_button_unchecked" },
  in_progress: { bg: "bg-[#dae2ff]", text: "text-[#004ab9]", icon: "pending" },
  review: { bg: "bg-[#cfe6f2]", text: "text-[#40555f]", icon: "rate_review" },
  testing: { bg: "bg-[#e3dbfd]", text: "text-[#524c68]", icon: "bug_report" },
  done: { bg: "bg-[#cfe6f2]", text: "text-[#2d424c]", icon: "check_circle" },
};

interface TaskRow {
  task: Task;
  projectName: string;
  projectId: string;
}

export default function ScheduleClient() {
  const { projects, unlockedProjectIds } = useProjects();

  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [view, setView] = useState<"list" | "group">("group");

  // Flatten all tasks including unlocked projects
  const allTasks: TaskRow[] = projects.flatMap((p) => {
    const accessible = !p.pin || unlockedProjectIds.has(p.id);
    if (!accessible) return [];
    return p.tasks.map((t) => ({ task: t, projectName: p.name, projectId: p.id }));
  });

  const filtered = allTasks.filter((row) => {
    if (filterStatus !== "all" && row.task.status !== filterStatus) return false;
    if (filterPriority !== "all" && row.task.priority !== filterPriority) return false;
    if (filterProject !== "all" && row.projectId !== filterProject) return false;
    return true;
  });

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((r) => r.task.status === "done").length;
  const urgentTasks = allTasks.filter((r) => r.task.priority === "urgent" && r.task.status !== "done").length;

  const TaskRowItem = ({ row }: { row: TaskRow }) => {
    const p = PRIORITY_MAP[row.task.priority];
    const s = STATUS_STYLES[row.task.status];
    return (
      <Link
        href={`/projects/${row.projectId}/board`}
        className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl hover:shadow-md transition-all group border border-[#abb3b7]/10"
      >
        <span className={`material-symbols-outlined text-lg ${s.text}`}
          style={row.task.status === "done" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
          {s.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${row.task.status === "done" ? "line-through text-[#737c7f]" : "text-[#2b3437]"}`}>
            {row.task.title}
          </p>
          <p className="text-[11px] text-[#586064] mt-0.5">{row.projectName}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {row.task.labels.slice(0, 1).map((l) => (
            <span key={l.id} className="px-2 py-0.5 bg-[#e3e9ec] text-[#586064] text-[10px] font-bold rounded hidden md:block">
              {l.name}
            </span>
          ))}
          <div className={`flex items-center gap-1 text-[10px] font-bold ${p.color}`}>
            <span className="material-symbols-outlined text-sm">{p.icon}</span>
            <span className="hidden md:block">{p.label}</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#0c56d0] flex items-center justify-center text-white text-[9px] font-bold">
            {row.task.assigneeInitials}
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.bg} ${s.text} hidden lg:block`}>
            {COLUMNS.find((c) => c.id === row.task.status)?.title}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="px-10 py-10 flex-grow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          Schedule
        </h1>
        <p className="text-[#4d626c] text-base">
          All tasks across your accessible projects in one view.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Tasks", value: totalTasks, icon: "task_alt", color: "text-[#0c56d0]", bg: "bg-[#dae2ff]" },
          { label: "Completed", value: doneTasks, icon: "check_circle", color: "text-[#4d626c]", bg: "bg-[#cfe6f2]" },
          { label: "Urgent", value: urgentTasks, icon: "priority_high", color: "text-[#9f403d]", bg: "bg-[#fe8983]/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 ghost-border flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#2b3437]" style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
              <p className="text-[11px] text-[#737c7f] font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          className="px-3 py-2 bg-white border border-[#abb3b7]/30 rounded-lg text-sm outline-none text-[#2b3437]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
        >
          <option value="all">All Statuses</option>
          {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select
          className="px-3 py-2 bg-white border border-[#abb3b7]/30 rounded-lg text-sm outline-none text-[#2b3437]"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          className="px-3 py-2 bg-white border border-[#abb3b7]/30 rounded-lg text-sm outline-none text-[#2b3437]"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-1 p-1 bg-white rounded-lg border border-[#abb3b7]/30">
          {(["list", "group"] as const).map((v) => (
            <button
              key={v}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${view === v ? "bg-[#0c56d0] text-white" : "text-[#586064] hover:bg-[#f1f4f6]"}`}
              onClick={() => setView(v)}
            >
              {v === "list" ? "List" : "Group"}
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-[#737c7f]">{filtered.length} tasks</span>
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-[#737c7f]">
          <span className="material-symbols-outlined text-4xl text-[#abb3b7]">inbox</span>
          <p className="font-medium">No tasks match your filters.</p>
        </div>
      ) : view === "list" ? (
        <div className="space-y-2">
          {filtered.map((row) => <TaskRowItem key={row.task.id} row={row} />)}
        </div>
      ) : (
        <div className="space-y-8">
          {COLUMNS.map((col) => {
            const colTasks = filtered.filter((r) => r.task.status === col.id);
            if (colTasks.length === 0) return null;
            const s = STATUS_STYLES[col.id];
            return (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`material-symbols-outlined text-lg ${s.text}`}>{col.icon}</span>
                  <h2 className="font-bold text-sm uppercase tracking-wider text-[#2b3437]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {col.title}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((row) => <TaskRowItem key={row.task.id} row={row} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
