"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "../../../lib/store";
import { Task, TaskStatus, Priority, Column } from "../../../types";
import TaskDrawer from "./TaskDrawer";
import AddTaskModal from "./AddTaskModal";

const COLUMNS: Column[] = [
  { id: "todo", title: "To Do", order: 0 },
  { id: "in_progress", title: "In Progress", order: 1 },
  { id: "review", title: "Review", order: 2 },
  { id: "testing", title: "Testing", order: 3 },
  { id: "done", title: "Done", order: 4 },
];

const PRIORITY_MAP: Record<Priority, { label: string; icon: string; color: string }> = {
  urgent: { label: "Urgent", icon: "priority_high", color: "text-[#9f403d]" },
  high: { label: "High", icon: "arrow_upward", color: "text-[#9f403d]" },
  medium: { label: "Medium", icon: "schedule", color: "text-[#0c56d0]" },
  low: { label: "Low", icon: "low_priority", color: "text-[#4d626c]" },
};

const LABEL_COLOR_MAP: Record<string, string> = {
  primary: "bg-[#dae2ff] text-[#004ab9]",
  secondary: "bg-[#cfe6f2] text-[#40555f]",
  tertiary: "bg-[#e3dbfd] text-[#524c68]",
  error: "bg-[#fe8983]/20 text-[#9f403d]",
};

const COL_BADGE_MAP: Record<TaskStatus, string> = {
  todo: "bg-[#e3e9ec]",
  in_progress: "bg-[#dae2ff] text-[#004ab9]",
  review: "bg-[#e3e9ec]",
  testing: "bg-[#e3e9ec]",
  done: "bg-[#cfe6f2] text-[#2d424c]",
};

interface TaskCardProps {
  task: Task;
  projectId: string;
  onOpen: (task: Task) => void;
  onDragStart: (taskId: string, fromStatus: TaskStatus) => void;
  isInProgress?: boolean;
}

function TaskCard({ task, projectId, onOpen, onDragStart, isInProgress }: TaskCardProps) {
  const priority = PRIORITY_MAP[task.priority];
  const { deleteTask } = useProjects();

  return (
    <div
      className={`group bg-white p-5 rounded-xl shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer ${
        isInProgress
          ? "border-l-4 border-[#0c56d0] ring-2 ring-[#0c56d0]/5"
          : ""
      } ${task.status === "testing" && task.labels.some((l) => l.color === "error")
        ? "border-l-4 border-[#9f403d]/50"
        : ""}`}
      draggable
      onClick={() => onOpen(task)}
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.setData("fromStatus", task.status);
        onDragStart(task.id, task.status);
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${LABEL_COLOR_MAP[label.color] ?? "bg-[#e3e9ec] text-[#586064]"}`}
            >
              {label.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-0.5 rounded hover:bg-[#f1f4f6] transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this task?")) {
                deleteTask(projectId, task.id);
              }
            }}
          >
            <span className="material-symbols-outlined text-sm text-[#9f403d]">
              delete
            </span>
          </button>
          <span className="material-symbols-outlined text-[#586064] text-base opacity-0 group-hover:opacity-100 transition-opacity">
            drag_indicator
          </span>
        </div>
      </div>

      <h4
        className={`font-bold text-[#2b3437] mb-2 ${task.status === "done" ? "line-through text-[#586064]" : ""}`}
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-[#586064] line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f1f4f6]">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${priority.color}`}>
            <span className="material-symbols-outlined text-xs">
              {priority.icon}
            </span>
            {priority.label}
          </div>
          {task.checklist.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-[#586064] font-medium">
              <span className="material-symbols-outlined text-sm">checklist</span>
              {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-[#586064] font-medium">
              <span className="material-symbols-outlined text-sm">attach_file</span>
              {task.attachments.length}
            </div>
          )}
        </div>
        <div className="w-6 h-6 rounded-full bg-[#0c56d0] flex items-center justify-center text-white text-[9px] font-bold">
          {task.assigneeInitials}
        </div>
      </div>
    </div>
  );
}

interface KanbanBoardClientProps {
  projectId: string;
}

export default function KanbanBoardClient({ projectId }: KanbanBoardClientProps) {
  const router = useRouter();
  const { projects, moveTask, unlockedProjectIds } = useProjects();
  const project = projects.find((p) => p.id === projectId);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const needsPin = !!project?.pin && !unlockedProjectIds.has(projectId);

  useEffect(() => {
    if (needsPin) {
      router.push(`/projects/${projectId}/pin`);
    }
  }, [needsPin, projectId, router]);

  // Redirect if project not found
  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#586064]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-3 block text-[#abb3b7]">
            folder_off
          </span>
          <p className="font-semibold">Project not found.</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting to PIN page
  if (needsPin) {
    return null;
  }

  const tasksByStatus = (status: TaskStatus) =>
    project.tasks.filter((t) => t.status === status);

  const handleDrop = (e: React.DragEvent, toStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      moveTask(projectId, taskId, toStatus);
    }
    setDragOverColumn(null);
    setDraggingTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Kanban Header */}
      <div className="px-10 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-[#dae2ff] text-[#004ab9] text-[10px] font-bold tracking-widest uppercase rounded">
                {project.id.toUpperCase()}
              </span>
              <h2
                className="text-3xl font-extrabold tracking-tight text-[#2b3437]"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {project.name}
              </h2>
            </div>
            <p className="text-[#586064] max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {Array.from({ length: Math.min(project.memberCount, 3) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#f8f9fa] bg-[#0c56d0] flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                )
              )}
              {project.memberCount > 3 && (
                <div className="w-10 h-10 rounded-full border-2 border-[#f8f9fa] bg-[#e3e9ec] flex items-center justify-center text-xs font-bold text-[#40555f]">
                  +{project.memberCount - 3}
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 bg-[#e3e9ec] hover:bg-[#dbe4e7] px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95">
              <span className="material-symbols-outlined text-sm">share</span>
              Invite
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto px-10 pb-8 flex gap-6 items-start hide-scrollbar">
        {COLUMNS.map((col) => {
          const tasks = tasksByStatus(col.id);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-80 flex flex-col gap-4 transition-all ${
                isDragOver ? "opacity-80" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-bold text-sm tracking-wide uppercase ${
                      col.id === "done" ? "text-[#4d626c]" : "text-[#2b3437]"
                    }`}
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {col.title}
                  </h3>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      COL_BADGE_MAP[col.id]
                    }`}
                  >
                    {tasks.length}
                  </span>
                </div>
                {col.id !== "done" && (
                  <button
                    className="p-1 hover:bg-[#e3e9ec] rounded transition-colors"
                    onClick={(e) => {
                       e.stopPropagation(); // Prevent propagation bubbling
                       startTransition(() => setAddingToColumn(col.id));
                    }}
                  >
                    <span className="material-symbols-outlined text-lg text-[#586064]">
                      add
                    </span>
                  </button>
                )}
              </div>

              {/* Drop zone highlight */}
              <div
                className={`flex flex-col gap-4 min-h-[200px] p-2 rounded-xl transition-all ${
                  isDragOver ? "bg-[#dae2ff]/30 border-2 border-dashed border-[#0c56d0]/30" : ""
                }`}
              >
                {tasks.length === 0 && !isDragOver && (
                  <div className="flex items-center justify-center h-24 text-[#abb3b7] text-xs font-medium border-2 border-dashed border-[#abb3b7]/20 rounded-xl">
                    {col.id === "done" ? "No completed tasks" : "No tasks"}
                  </div>
                )}
                <div className={col.id === "done" ? "opacity-70 flex flex-col gap-4" : "flex flex-col gap-4"}>
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectId={projectId}
                      onOpen={setSelectedTask}
                      onDragStart={(id) => setDraggingTaskId(id)}
                      isInProgress={col.id === "in_progress"}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Drawer */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Add Task Modal */}
      {addingToColumn && (
        <AddTaskModal
          projectId={projectId}
          status={addingToColumn}
          onClose={() => setAddingToColumn(null)}
        />
      )}
    </div>
  );
}
