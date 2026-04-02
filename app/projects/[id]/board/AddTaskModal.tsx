"use client";

import { useState } from "react";
import { useProjects } from "../../../lib/store";
import { Task, TaskStatus, Priority, Label } from "../../../types";

interface AddTaskModalProps {
  projectId: string;
  status: TaskStatus;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const LABEL_OPTIONS: { name: string; color: Label["color"] }[] = [
  { name: "frontend", color: "secondary" },
  { name: "backend", color: "secondary" },
  { name: "design", color: "tertiary" },
  { name: "QA", color: "secondary" },
  { name: "Bug", color: "error" },
  { name: "docs", color: "secondary" },
];

export default function AddTaskModal({ projectId, status, onClose }: AddTaskModalProps) {
  const { addTask, currentProfile } = useProjects();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [selectedLabels, setSelectedLabels] = useState<typeof LABEL_OPTIONS>([]);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const toggleLabel = (label: typeof LABEL_OPTIONS[0]) => {
    setSelectedLabels((prev) =>
      prev.some((l) => l.name === label.name)
        ? prev.filter((l) => l.name !== label.name)
        : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    addTask(projectId, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      labels: selectedLabels.map((l, i) => ({
        id: `label-${Date.now()}-${i}`,
        name: l.name,
        color: l.color,
      })),
      checklist: [],
      attachments: [],
      testingNotes: "",
      assigneeInitials: currentProfile?.username ? currentProfile.username.slice(0, 2).toUpperCase() : "??",
      assigneeName: currentProfile?.username ?? "Anonymous",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
        style={{ boxShadow: "0 24px 48px rgba(43,52,55,0.12)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
            Add Task
          </h2>
          <button className="p-1 hover:bg-[#e3e9ec] rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-1">Title</label>
            <input
              autoFocus
              className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all"
              placeholder="Task title..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
            />
            {error && <p className="text-xs text-[#9f403d] mt-1">{error}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all resize-none"
              placeholder="Optional description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#586064] block mb-1">Priority</label>
              <select
                className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#586064] block mb-1">
                Deadline <span className="text-[#abb3b7] font-normal">(optional)</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-2">Labels</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => {
                const selected = selectedLabels.some((l) => l.name === label.name);
                return (
                  <button
                    key={label.name}
                    type="button"
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      selected ? "bg-[#0c56d0] text-white" : "bg-[#e3e9ec] text-[#586064] hover:bg-[#dbe4e7]"
                    }`}
                    onClick={() => toggleLabel(label)}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 px-4 py-2.5 rounded-full border border-[#e3e9ec] text-sm font-semibold text-[#586064] hover:bg-[#f1f4f6] transition-colors active:scale-95"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex-1 primary-gradient text-white px-4 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-all"
              type="submit"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
