"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "../../../lib/store";
import { Task, TaskStatus, Priority, Column } from "../../../types";
import TaskDrawer from "./TaskDrawer";
import AddTaskModal from "./AddTaskModal";
import InviteModal from "./InviteModal";
import ConfirmModal from "../../../components/ConfirmModal";
import { getUserColor } from "../../../lib/avatarColors";

const COLUMNS: Column[] = [
  { id: "todo", title: "To Do", order: 0 },
  { id: "in_progress", title: "In Progress", order: 1 },
  { id: "review", title: "Review", order: 2 },
  { id: "testing", title: "Testing", order: 3 },
  { id: "done", title: "Done", order: 4 },
];

const PRIORITY_MAP: Record<Priority, { label: string; icon: string; color: string }> = {
  urgent: { label: "Urgent", icon: "priority_high", color: "text-[#9f403d] bg-[#fee2e2] px-2 py-0.5 rounded" },
  high: { label: "High", icon: "arrow_upward", color: "text-[#d97706] bg-[#fef3c7] px-2 py-0.5 rounded" },
  medium: { label: "Medium", icon: "schedule", color: "text-[#0c56d0] bg-[#dae2ff] px-2 py-0.5 rounded" },
  low: { label: "Low", icon: "low_priority", color: "text-[#059669] bg-[#d1fae5] px-2 py-0.5 rounded" },
};

const LABEL_COLOR_MAP: Record<string, string> = {
  primary: "bg-[#dae2ff] text-[#004ab9]",
  secondary: "bg-[#cfe6f2] text-[#40555f]",
  tertiary: "bg-[#e3dbfd] text-[#524c68]",
  error: "bg-[#fee2e2] text-[#9f403d]",
  warning: "bg-[#fef3c7] text-[#92400e]",
  success: "bg-[#d1fae5] text-[#065f46]",
  info: "bg-[#e0f2fe] text-[#0369a1]",
};

const COL_BADGE_MAP: Record<TaskStatus, string> = {
  todo: "bg-[#e3e9ec]",
  in_progress: "bg-[#dae2ff] text-[#004ab9]",
  review: "bg-[#fef3c7] text-[#92400e]",
  testing: "bg-[#e3dbfd] text-[#524c68]",
  done: "bg-[#d1fae5] text-[#065f46]",
};

const STATUS_THEME_MAP: Record<TaskStatus, { card: string; bar: string; icon: string; iconColor: string }> = {
  todo: { 
    card: "border-l-4 border-outline-variant/30", 
    bar: "bg-outline-variant/30", 
    icon: "assignment", 
    iconColor: "text-on-surface-variant" 
  },
  in_progress: { 
    card: "border-l-4 border-primary bg-primary/5 shadow-lg shadow-primary/5", 
    bar: "bg-primary", 
    icon: "sync", 
    iconColor: "text-primary" 
  },
  review: { 
    card: "border-l-4 border-amber-600 bg-amber-500/5", 
    bar: "bg-amber-600", 
    icon: "visibility", 
    iconColor: "text-amber-600" 
  },
  testing: { 
    card: "border-l-4 border-tertiary bg-tertiary/5", 
    bar: "bg-tertiary", 
    icon: "biotech", 
    iconColor: "text-tertiary" 
  },
  done: { 
    card: "border-l-4 border-emerald-600 opacity-75 grayscale-[0.2] hover:grayscale-0 hover:opacity-100", 
    bar: "bg-emerald-600", 
    icon: "check_circle", 
    iconColor: "text-emerald-600" 
  },
};

function getDueDateBadge(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done") return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Overdue", color: "bg-[#fe8983]/20 text-[#9f403d]", icon: "warning", urgent: true };
  if (diff === 0) return { label: "Due today", color: "bg-[#fef3c7] text-[#92400e]", icon: "today", urgent: true };
  if (diff <= 3) return { label: `${diff}d left`, color: "bg-[#fef3c7] text-[#92400e]", icon: "schedule", urgent: false };
  return { label: `${diff}d`, color: "bg-[#e3e9ec] text-[#586064]", icon: "event", urgent: false };
}

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
  const [showConfirm, setShowConfirm] = useState(false);
  const badge = getDueDateBadge(task.dueDate, task.status);
  const isOverdue = badge?.urgent && badge.label === "Overdue";
  const theme = STATUS_THEME_MAP[task.status];
  
  // Custom border override for specific error state in testing
  const testingError = task.status === "testing" && task.labels.some((l) => l.color === "error");

  return (
    <div
      className={`group bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${theme.card} ${
        testingError ? "!border-error/70 !bg-error/5" : ""
      } ${isOverdue ? "!border-error/70" : ""}`}
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
              setShowConfirm(true);
            }}
          >
            <span className="material-symbols-outlined text-sm text-[#9f403d]">delete</span>
          </button>
          <span className="material-symbols-outlined text-[#586064] text-base opacity-0 group-hover:opacity-100 transition-opacity">
            drag_indicator
          </span>
          {showConfirm && (
            <ConfirmModal
              title="Delete Task"
              message={`Are you sure you want to completely delete "${task.title}"? This cannot be undone.`}
              confirmText="Delete"
              onCancel={(e?: any) => { e?.stopPropagation(); setShowConfirm(false); }}
              onConfirm={(e?: any) => {
                e?.stopPropagation();
                deleteTask(projectId, task.id);
                setShowConfirm(false);
              }}
            />
          )}
        </div>
      </div>

      <h4
        className={`font-bold text-[#2b3437] mb-2 ${task.status === "done" ? "line-through text-[#586064]" : ""}`}
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-[#586064] line-clamp-2 leading-relaxed mb-3">
          {task.description}
        </p>
      )}

      {/* Due date badge with enhanced UI */}
      {badge && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit mb-3 shadow-sm ${badge.color}`}>
          <span className="material-symbols-outlined text-xs">{badge.icon}</span>
          {badge.label}
        </div>
      )}

      {/* Subtle background status icon */}
      <span className={`material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity ${theme.iconColor}`}>
        {theme.icon}
      </span>

      <div className="flex items-center justify-between pt-3 border-t border-[#f1f4f6]">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${priority.color}`}>
            <span className="material-symbols-outlined text-xs">{priority.icon}</span>
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
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
          style={{ backgroundColor: getUserColor(task.assigneeName) }}
        >
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
  const { projects, moveTask, unlockedProjectIds, currentUserId } = useProjects();
  const project = projects.find((p) => p.id === projectId);
  
  const isOwner = project?.members.some((m) => m.id === currentUserId && m.role === "owner") ?? false;
  const isMemberOrOwner = project?.members.some((m) => m.id === currentUserId && (m.role === "member" || m.role === "owner")) ?? false;
  const isViewer = project?.members.some((m) => m.id === currentUserId && m.role === "viewer") ?? false;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

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
          <span className="material-symbols-outlined text-5xl mb-3 block text-[#abb3b7]">folder_off</span>
          <p className="font-semibold">Project not found.</p>
        </div>
      </div>
    );
  }

  if (needsPin) return null;

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
      <div className="px-5 md:px-10 py-6 md:py-8">
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
            <p className="text-[#586064] max-w-2xl leading-relaxed">{project.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {project.members.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="w-10 h-10 rounded-full border-2 border-[#f8f9fa] flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                  style={{ backgroundColor: getUserColor(m.username) }}
                  title={`${m.username} (${m.role})`}
                >
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt={m.username} className="w-full h-full object-cover" />
                  ) : (
                    m.username.slice(0, 2).toUpperCase()
                  )}
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-[#f8f9fa] bg-[#e3e9ec] flex items-center justify-center text-xs font-bold text-[#40555f]">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
            {isMemberOrOwner && (
              <button 
                className="flex items-center gap-2 bg-white border border-[#0c56d0]/30 hover:border-[#0c56d0] text-[#0c56d0] px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 shadow-sm"
                onClick={() => setIsInviteOpen(true)}
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Invite
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto px-5 md:px-10 pb-8 flex gap-6 items-start hide-scrollbar">
        {COLUMNS.map((col) => {
          const tasks = tasksByStatus(col.id);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-80 flex flex-col gap-4 transition-all ${isDragOver ? "opacity-80" : ""}`}
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
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${COL_BADGE_MAP[col.id]}`}>
                    {tasks.length}
                  </span>
                </div>
                {col.id !== "done" && (
                  <button
                    className="p-1 hover:bg-[#e3e9ec] rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      startTransition(() => setAddingToColumn(col.id));
                    }}
                  >
                    <span className="material-symbols-outlined text-lg text-[#586064]">add</span>
                  </button>
                )}
              </div>

              {/* Drop zone */}
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
          task={project.tasks.find(t => t.id === selectedTask.id) || selectedTask}
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

      {/* Invite Modal */}
      {isInviteOpen && (
        <InviteModal
          projectId={projectId}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </div>
  );
}
