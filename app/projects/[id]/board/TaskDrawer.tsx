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

const TESTING_STATUS_OPTIONS: { value: Task["testingStatus"]; label: string; color: string; icon: string }[] = [
  { value: "not_tested", label: "Not Tested", color: "bg-[#e3e9ec] text-[#586064]", icon: "pending" },
  { value: "under_review", label: "Under Review", color: "bg-[#e3dbfd] text-[#524c68]", icon: "visibility" },
  { value: "passed", label: "Passed", color: "bg-[#d1fae5] text-[#065f46]", icon: "check_circle" },
  { value: "failed", label: "Failed", color: "bg-[#fee2e2] text-[#991b1b]", icon: "cancel" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function getDueDateStatus(dueDate: string | null) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Overdue", color: "bg-[#fe8983]/20 text-[#9f403d] border-[#9f403d]/20", icon: "warning" };
  if (diff === 0) return { label: "Due today", color: "bg-[#fef3c7] text-[#92400e] border-[#92400e]/20", icon: "today" };
  if (diff <= 3) return { label: `${diff}d left`, color: "bg-[#fef3c7] text-[#92400e] border-[#92400e]/20", icon: "schedule" };
  return { label: `${diff} days left`, color: "bg-[#e3e9ec] text-[#586064] border-[#abb3b7]/20", icon: "event" };
}

export default function TaskDrawer({ task, projectId, onClose }: TaskDrawerProps) {
  const { updateTask } = useProjects();
  const [testingNotes, setTestingNotes] = useState(task.testingNotes);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.substring(0, 10) : "");
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const priority = PRIORITY_MAP[task.priority];
  const completedItems = task.checklist.filter((c) => c.done).length;
  const totalItems = task.checklist.length;
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const dueDateStatus = getDueDateStatus(task.dueDate);

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
    updateTask(projectId, task.id, { testingNotes, status: "done" });
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

  const handleDueDateSave = () => {
    updateTask(projectId, task.id, { dueDate: dueDate ? new Date(dueDate).toISOString() : null });
    setShowDueDatePicker(false);
  };

  const handleClearDueDate = () => {
    setDueDate("");
    updateTask(projectId, task.id, { dueDate: null });
    setShowDueDatePicker(false);
  };

  const handleTestingStatusChange = (newTestingStatus: Task["testingStatus"]) => {
    updateTask(projectId, task.id, { testingStatus: newTestingStatus });
  };

  const filteredNotifications = useProjects().notifications.filter(n => n.project_id === projectId).slice(0, 8);

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-[1000px] bg-white h-full shadow-2xl flex border-l border-[#eaeff1]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#dae2ff] text-[#004ab9] text-[10px] font-bold tracking-widest uppercase rounded">
                PROJ-{task.id.slice(0, 4).toUpperCase()}
              </span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0c56d0] text-sm">view_kanban</span>
                <span className="text-xs font-bold text-[#586064] tracking-wider uppercase">
                  {STATUS_OPTIONS.find((s) => s.value === task.status)?.label}
                </span>
              </div>
            </div>
            <button
              className="p-2 hover:bg-[#e3e9ec] rounded-full transition-colors md:hidden"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-12 hide-scrollbar">
            {/* Title */}
            {editingTitle ? (
              <input
                autoFocus
                className="text-4xl font-extrabold text-[#2b3437] mb-8 w-full bg-transparent border-b-2 border-[#0c56d0] outline-none pb-2 transition-all"
                style={{ fontFamily: "Outfit, sans-serif" }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
              />
            ) : (
              <h2
                className="text-4xl font-extrabold text-[#2b3437] mb-8 cursor-pointer hover:text-[#0c56d0] transition-colors leading-tight"
                style={{ fontFamily: "Outfit, sans-serif" }}
                onClick={() => setEditingTitle(true)}
              >
                {task.title}
              </h2>
            )}

            {/* Meta Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-4 rounded-2xl border border-[#eaeff1] shadow-sm hover:shadow-md transition-shadow">
                <label className="text-[10px] font-bold text-[#abb3b7] uppercase tracking-widest block mb-3">Assignee</label>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0c56d0] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    {task.assigneeInitials}
                  </div>
                  <span className="text-sm font-bold text-[#2b3437]">{task.assigneeName}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#eaeff1] shadow-sm hover:shadow-md transition-shadow">
                <label className="text-[10px] font-bold text-[#abb3b7] uppercase tracking-widest block mb-3">Priority</label>
                <div className={`flex items-center gap-2 text-sm font-bold ${priority.color}`}>
                  <span className="material-symbols-outlined text-xl">{priority.icon}</span>
                  {priority.label}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#eaeff1] shadow-sm hover:shadow-md transition-shadow">
                <label className="text-[10px] font-bold text-[#abb3b7] uppercase tracking-widest block mb-3">Testing State</label>
                <select
                  className={`text-[11px] font-bold rounded-lg px-3 py-1.5 border-none outline-none cursor-pointer w-full text-center ${TESTING_STATUS_OPTIONS.find(t => t.value === task.testingStatus)?.color}`}
                  value={task.testingStatus}
                  onChange={(e) => handleTestingStatusChange(e.target.value as Task["testingStatus"])}
                >
                  {TESTING_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Card */}
            <div className="mb-10 group">
              <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">subject</span>
                Description
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-[#eaeff1] text-sm leading-relaxed text-[#586064] shadow-sm group-hover:shadow-md transition-shadow italic">
                {task.description || "Transfer all legacy endpoints from the internal Express monolith to the new cloud-native AWS API Gateway infrastructure..."}
              </div>
            </div>

            {/* Checklist with Proper Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">checklist</span>
                  Checklist
                </h3>
                <span className="text-[11px] font-bold text-[#0c56d0]">{percent}% Complete</span>
              </div>
              <div className="h-2 bg-[#eaeff1] rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-[#0c56d0] rounded-full transition-all duration-500 ease-out" style={{ width: `${percent}%` }} />
              </div>
              <div className="space-y-4">
                {(task.checklist.length > 0 ? task.checklist : [
                  { id: '1', text: 'Define CloudFormation template', done: true },
                  { id: '2', text: 'Configure VPC Link for Auth Service', done: false },
                  { id: '3', text: 'Test Lambda Authorizer latency', done: false }
                ]).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => handleChecklistToggle(item.id, !item.done)}>
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${item.done ? "bg-[#0c56d0] border-[#0c56d0] text-white shadow-lg shadow-[#0c56d0]/20" : "border-[#abb3b7] group-hover:border-[#0c56d0]"}`}>
                      {item.done && <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>}
                    </div>
                    <span className={`text-[13px] font-medium transition-colors ${item.done ? "text-[#abb3b7] line-through" : "text-[#2b3437]"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="mb-10">
              <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">attachment</span>
                Attachments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(task.attachments.length > 0 ? task.attachments : [
                  { id: 'a1', name: 'GitHub Repository', subtitle: 'infra-main/gateway-configs', icon: 'code', url: '#' },
                  { id: 'a2', name: 'Pull Request #412', subtitle: 'PR for migration draft', icon: 'merge', url: '#' }
                ]).map((att) => (
                  <a key={att.id} href={att.url} className="flex items-center gap-4 p-4 bg-white border border-[#eaeff1] rounded-2xl hover:border-[#0c56d0] hover:shadow-md transition-all group">
                    <div className="w-11 h-11 bg-[#f1f4f6] rounded-xl flex items-center justify-center text-[#586064] group-hover:bg-[#dae2ff] group-hover:text-[#0c56d0] transition-colors">
                      <span className="material-symbols-outlined">{att.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#2b3437] truncate">{att.name}</p>
                      <p className="text-[10px] font-medium text-[#abb3b7] uppercase tracking-tight">{att.subtitle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Testing Notes Card */}
            <div>
              <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">description</span>
                Testing Notes
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-[#eaeff1] mb-4 shadow-sm">
                <textarea
                  className="w-full bg-transparent border-none rounded-xl text-sm p-0 outline-none h-32 resize-none text-[#586064] placeholder-[#abb3b7]/60"
                  placeholder="Add details about test results or edge cases..."
                  value={testingNotes}
                  onChange={(e) => setTestingNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="px-6 py-2.5 bg-white border border-[#eaeff1] rounded-xl text-xs font-bold text-[#586064] hover:bg-[#f1f4f6] transition-all active:scale-95 shadow-sm"
                  onClick={handleSaveNotes}
                >
                  Save Draft
                </button>
                <button
                  className="px-6 py-2.5 bg-[#0c56d0] text-white rounded-xl text-xs font-bold hover:shadow-lg shadow-[#0c56d0]/20 transition-all active:scale-95"
                  onClick={handleMarkPassed}
                >
                  Mark as Passed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Activity & Footer */}
        <div className="w-80 border-l border-[#eaeff1] flex flex-col bg-white">
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest">Recent Activity</h3>
               <button className="p-2 hover:bg-[#f1f4f6] rounded-full transition-colors hidden md:block" onClick={onClose}>
                 <span className="material-symbols-outlined text-xl">close</span>
               </button>
            </div>

            <div className="space-y-8">
              {filteredNotifications.length > 0 ? filteredNotifications.map((notif, i) => (
                <div key={notif.id || i} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-[#0c56d0] flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-md">
                    {notif.actor_id === useProjects().currentUserId ? 'ME' : '??'}
                  </div>
                  <div>
                    <p className="text-[13px] leading-snug text-[#2b3437]">
                      <span className="font-bold">You</span> {notif.type.includes('move') ? 'moved' : 'updated'} <span className="text-[#0c56d0] font-medium">{task.title.slice(0, 15)}...</span>
                    </p>
                    <p className="text-[10px] text-[#abb3b7] mt-1 flex items-center gap-1 font-medium">
                       <span className="material-symbols-outlined text-[10px]">schedule</span>
                       {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                  <span className="material-symbols-outlined text-4xl mb-2">history</span>
                  <p className="text-xs">No activity log yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto p-8 border-t border-[#eaeff1] bg-[#f8f9fa]/50">
             <div className="bg-white p-5 rounded-2xl border border-dashed border-[#eaeff1]">
                <label className="text-[10px] font-bold text-[#abb3b7] uppercase tracking-widest block mb-2">Sprint Goal</label>
                <p className="text-[11px] leading-relaxed text-[#586064] font-medium">
                  "Complete all API migrations and finalize the UI system documentation by EOD Friday."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
