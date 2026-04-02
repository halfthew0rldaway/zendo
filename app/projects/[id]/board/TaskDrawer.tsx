"use client";

import { useState } from "react";
import { Task, Priority, TaskStatus } from "../../../types";
import { useProjects } from "../../../lib/store";

interface TaskDrawerProps {
  task: Task;
  projectId: string;
  onClose: () => void;
}

const PRIORITY_MAP: Record<Priority, { label: string; icon: string; color: string }> = {
  urgent: { label: "Urgent", icon: "priority_high", color: "text-[#9f403d]" },
  high: { label: "High", icon: "arrow_upward", color: "text-[#9f403d]" },
  medium: { label: "Medium", icon: "schedule", color: "text-[#0c56d0]" },
  low: { label: "Low", icon: "low_priority", color: "text-[#4d626c]" },
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "testing", label: "Testing" },
  { value: "done", label: "Done" },
];

export default function TaskDrawer({
  task,
  projectId,
  onClose,
}: TaskDrawerProps) {
  const { updateTask } = useProjects();
  const [testingNotes, setTestingNotes] = useState(task.testingNotes);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);

  const priority = PRIORITY_MAP[task.priority];
  const completedItems = task.checklist.filter((c) => c.done).length;
  const totalItems = task.checklist.length;
  const percent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleChecklistToggle = (itemId: string, done: boolean) => {
    const newChecklist = task.checklist.map((c) =>
      c.id === itemId ? { ...c, done } : c
    );
    updateTask(projectId, task.id, { checklist: newChecklist });
  };

  const handleSaveNotes = () => {
    updateTask(projectId, task.id, { testingNotes });
  };

  const handleMarkPassed = () => {
    updateTask(projectId, task.id, {
      testingNotes,
      status: "done",
    });
    onClose();
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask(projectId, task.id, { status: newStatus });
  };

  const handleTitleSave = () => {
    if (title.trim()) {
      updateTask(projectId, task.id, { title: title.trim() });
    }
    setEditingTitle(false);
  };

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-[#f8f9fa] h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0c56d0]">
              view_kanban
            </span>
            <span className="text-xs font-bold text-[#586064] tracking-wider uppercase">
              {STATUS_OPTIONS.find((s) => s.value === task.status)?.label} /{" "}
              {task.id.toUpperCase()}
            </span>
          </div>
          <button
            className="p-2 hover:bg-[#e3e9ec] rounded-full transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 hide-scrollbar">
          {/* Title */}
          {editingTitle ? (
            <input
              autoFocus
              className="text-3xl font-extrabold text-[#2b3437] mb-6 w-full bg-transparent border-b-2 border-[#0c56d0] outline-none pb-1"
              style={{ fontFamily: "Outfit, sans-serif" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            />
          ) : (
            <h2
              className="text-3xl font-extrabold text-[#2b3437] mb-6 cursor-pointer hover:text-[#0c56d0] transition-colors"
              style={{ fontFamily: "Outfit, sans-serif" }}
              onClick={() => setEditingTitle(true)}
              title="Click to edit"
            >
              {task.title}
            </h2>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-3 gap-8 mb-10">
            <div>
              <label className="text-[10px] font-bold text-[#586064] uppercase tracking-widest block mb-2">
                Assignee
              </label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0c56d0] flex items-center justify-center text-white text-xs font-bold">
                  {task.assigneeInitials}
                </div>
                <span className="text-sm font-medium">{task.assigneeName}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#586064] uppercase tracking-widest block mb-2">
                Priority
              </label>
              <div
                className={`flex items-center gap-2 text-sm font-bold ${priority.color}`}
              >
                <span className="material-symbols-outlined text-base">
                  {priority.icon}
                </span>
                {priority.label}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#586064] uppercase tracking-widest block mb-2">
                Status
              </label>
              <select
                className="text-xs font-bold bg-[#e3e9ec] rounded-full px-3 py-1 border-none outline-none cursor-pointer"
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-[#2b3437] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">subject</span>
              Description
            </h3>
            <div className="bg-[#f1f4f6] p-6 rounded-xl text-sm leading-relaxed text-[#586064]">
              {task.description || (
                <span className="italic text-[#737c7f]">
                  No description provided.
                </span>
              )}
            </div>
          </div>

          {/* Checklist */}
          {task.checklist.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#2b3437] flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    checklist
                  </span>
                  Checklist
                </h3>
                <span className="text-[10px] font-bold text-[#0c56d0]">
                  {percent}% Complete
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-[#e3e9ec] rounded-full mb-4">
                <div
                  className="h-1 bg-[#0c56d0] rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="space-y-3">
                {task.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <button
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        item.done
                          ? "bg-[#0c56d0] border-[#0c56d0] text-white"
                          : "border-[#737c7f] group-hover:border-[#0c56d0]"
                      }`}
                      onClick={() =>
                        handleChecklistToggle(item.id, !item.done)
                      }
                    >
                      {item.done && (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "14px" }}
                        >
                          check
                        </span>
                      )}
                    </button>
                    <span
                      className={`text-sm ${
                        item.done
                          ? "text-[#586064] line-through"
                          : "text-[#2b3437]"
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-bold text-[#2b3437] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  attachment
                </span>
                Attachments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.attachments.map((att) => (
                  <a
                    key={att.id}
                    className="flex items-center gap-3 p-3 border border-[#abb3b7]/30 rounded-lg hover:bg-[#f1f4f6] transition-colors"
                    href={att.url}
                  >
                    <div className="w-8 h-8 bg-[#e3e9ec] rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">
                        {att.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{att.name}</p>
                      <p className="text-[10px] text-[#586064] truncate">
                        {att.subtitle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Testing Notes */}
          <div>
            <h3 className="text-sm font-bold text-[#2b3437] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                description
              </span>
              Testing Notes
            </h3>
            <textarea
              className="w-full bg-[#f1f4f6] border-none rounded-xl text-sm p-4 outline-none focus:ring-2 focus:ring-[#0c56d0]/20 h-32 resize-none"
              placeholder="Add details about test results or edge cases..."
              value={testingNotes}
              onChange={(e) => setTestingNotes(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button
                className="px-4 py-2 bg-[#e3e9ec] rounded-full text-xs font-bold hover:bg-[#dbe4e7] transition-colors active:scale-95"
                onClick={handleSaveNotes}
              >
                Save Draft
              </button>
              <button
                className="px-4 py-2 bg-[#0c56d0] text-white rounded-full text-xs font-bold active:scale-95 transition-all"
                onClick={handleMarkPassed}
              >
                Mark as Passed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
