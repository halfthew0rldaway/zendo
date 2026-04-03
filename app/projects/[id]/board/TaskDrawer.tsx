"use client";

import { useState } from "react";
import { Task, Priority, TaskStatus, ChecklistItem, Attachment } from "../../../types";
import { useProjects } from "../../../lib/store";
import { getUserColor } from "../../../lib/avatarColors";

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

export default function TaskDrawer({ task, projectId, onClose }: TaskDrawerProps) {
  const { updateTask, updateProject, projects, notifications, currentUserId } = useProjects();
  const project = projects.find(p => p.id === projectId);
  
  const [testingNotes, setTestingNotes] = useState(task.testingNotes || "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState(task.description);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [showAddCheck, setShowAddCheck] = useState(false);
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [newAttName, setNewAttName] = useState("");
  const [newAttUrl, setNewAttUrl] = useState("");
  
  const [editingSprintGoal, setEditingSprintGoal] = useState(false);
  const [sprintGoal, setSprintGoal] = useState(project?.sprintGoal || "");

  const currentAssigneeMember = project?.members.find(m => m.id === task.assigneeId || (task.assigneeId === null && m.username === task.assigneeName));
  const currentAssigneeId = currentAssigneeMember?.id || "";

  const priority = PRIORITY_MAP[task.priority];
  const completedItems = task.checklist?.filter((c) => c.done).length || 0;
  const totalItems = task.checklist?.length || 0;
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleChecklistToggle = (itemId: string, done: boolean) => {
    const newChecklist = task.checklist.map((c) =>
      c.id === itemId ? { ...c, done } : c
    );
    updateTask(projectId, task.id, { checklist: newChecklist });
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newCheckItem,
      done: false
    };
    updateTask(projectId, task.id, { checklist: [...(task.checklist || []), newItem] });
    setNewCheckItem("");
    setShowAddCheck(false);
  };

  const handleAddAttachment = () => {
    if (!newAttName.trim() || !newAttUrl.trim()) return;
    let url = newAttUrl;
    if (!url.startsWith('http')) url = 'https://' + url;
    
    let hostname = 'link';
    try { hostname = new URL(url).hostname; } catch(e) {}

    const newAtt: Attachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAttName,
      url: url,
      subtitle: hostname,
      type: 'link',
      icon: url.includes('github') ? 'code' : 'link'
    };
    updateTask(projectId, task.id, { attachments: [...(task.attachments || []), newAtt] });
    setNewAttName("");
    setNewAttUrl("");
    setShowAddAttachment(false);
  };

  const handleSaveNotes = () => {
    updateTask(projectId, task.id, { testingNotes });
  };

  const handleMarkPassed = () => {
    updateTask(projectId, task.id, { testingNotes, testingStatus: "passed", status: "done" });
    onClose();
  };

  const handleTitleSave = () => {
    if (title.trim()) {
      updateTask(projectId, task.id, { title: title.trim() });
    }
    setEditingTitle(false);
  };

  const handleTestingStatusChange = (newTestingStatus: Task["testingStatus"]) => {
    updateTask(projectId, task.id, { testingStatus: newTestingStatus });
  };

  const handleDescSave = () => {
    updateTask(projectId, task.id, { description: desc.trim() });
    setEditingDesc(false);
  };
  
  const handleSprintGoalSave = () => {
    updateProject(projectId, { sprintGoal: sprintGoal.trim() });
    setEditingSprintGoal(false);
  };
  
  const handlePriorityChange = (newPrio: Priority) => {
    updateTask(projectId, task.id, { priority: newPrio });
  };
  
  const handleAssigneeChange = (memberId: string) => {
    if (!memberId) {
      updateTask(projectId, task.id, { assigneeId: null, assigneeName: "Unassigned", assigneeInitials: "?" });
      return;
    }
    const member = project?.members.find(m => m.id === memberId);
    if (member) {
      updateTask(projectId, task.id, { 
        assigneeId: member.id, 
        assigneeName: member.username, 
        assigneeInitials: member.username.slice(0,2).toUpperCase() 
      });
    }
  };

  const handleRemoveCheckItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(projectId, task.id, { checklist: task.checklist.filter(c => c.id !== id) });
  };

  const handleRemoveAttachment = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateTask(projectId, task.id, { attachments: task.attachments.filter(a => a.id !== id) });
  };

  const filteredNotifications = notifications.filter(n => n.project_id === projectId).slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[100] flex justify-end md:p-4">
      <div className="w-full max-w-[1000px] h-full bg-white md:rounded-2xl shadow-2xl flex flex-col md:flex-row md:overflow-hidden overflow-y-auto">
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

          <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-12 hide-scrollbar">
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
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner"
                    style={{ backgroundColor: currentAssigneeMember ? getUserColor(currentAssigneeMember.username) : "#0c56d0" }}
                  >
                    {currentAssigneeMember ? currentAssigneeMember.username.slice(0,2).toUpperCase() : task.assigneeInitials}
                  </div>
                  <select 
                    className="flex-1 text-sm font-bold text-[#2b3437] bg-transparent outline-none cursor-pointer"
                    value={currentAssigneeId}
                    onChange={e => handleAssigneeChange(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {project?.members.map(m => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#eaeff1] shadow-sm hover:shadow-md transition-shadow">
                <label className="text-[10px] font-bold text-[#abb3b7] uppercase tracking-widest block mb-3">Priority</label>
                <div className={`flex items-center gap-2 text-sm font-bold ${priority.color}`}>
                  <span className="material-symbols-outlined text-xl">{priority.icon}</span>
                  <select 
                    className="flex-1 font-bold bg-transparent outline-none cursor-pointer appearance-none"
                    value={task.priority}
                    onChange={e => handlePriorityChange(e.target.value as Priority)}
                  >
                    {Object.entries(PRIORITY_MAP).map(([val, p]) => (
                      <option key={val} value={val} className="text-black">{p.label}</option>
                    ))}
                  </select>
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

            {/* GitHub Link */}
            <div className="mb-10">
              <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#181717]">code</span>
                GitHub Link
              </h3>
              <div className="bg-white p-3 rounded-2xl border border-[#eaeff1] flex items-center gap-3 shadow-sm hover:border-[#0c56d0]/40 transition-all">
                <input
                  className="flex-1 bg-transparent border-none text-sm outline-none text-[#586064] px-2"
                  placeholder="Paste GitHub commit or PR link..."
                  value={task.githubLink || ""}
                  onChange={(e) => updateTask(projectId, task.id, { githubLink: e.target.value })}
                />
              </div>
            </div>

            {/* Description Card */}
            <div className="mb-10 group">
              <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#0c56d0]">subject</span>
                Description
              </h3>
              {editingDesc ? (
                <div className="bg-white p-6 rounded-2xl border border-[#0c56d0] shadow-sm transform transition-all">
                  <textarea
                    autoFocus
                    className="w-full bg-transparent border-none rounded-xl text-sm p-0 outline-none min-h-[100px] resize-y text-[#586064]"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    onBlur={handleDescSave}
                  />
                  <div className="flex justify-end mt-2">
                     <button onClick={handleDescSave} className="text-xs text-white bg-[#0c56d0] px-3 py-1.5 rounded-lg font-bold">Save</button>
                  </div>
                </div>
              ) : (
                <div 
                  className="bg-white p-6 rounded-2xl border border-[#eaeff1] text-sm leading-relaxed text-[#586064] shadow-sm hover:shadow-md hover:border-[#0c56d0]/30 transition-all italic cursor-pointer min-h-[100px]"
                  onClick={() => { setDesc(task.description || ""); setEditingDesc(true); }}
                >
                  {task.description || "Click to add description..."}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#059669]">checklist</span>
                  Checklist
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold text-[#0c56d0]">{percent}% Complete</span>
                  <button 
                    onClick={() => setShowAddCheck(!showAddCheck)}
                    className="w-6 h-6 rounded-full bg-[#0c56d0] text-white flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm">{showAddCheck ? 'close' : 'add'}</span>
                  </button>
                </div>
              </div>
              <div className="h-2 bg-[#eaeff1] rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-[#0c56d0] rounded-full transition-all duration-500 ease-out" style={{ width: `${percent}%` }} />
              </div>

              {showAddCheck && (
                <div className="mb-4 flex gap-2">
                  <input 
                    className="flex-1 bg-white border border-[#eaeff1] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0c56d0]"
                    placeholder="Add item..."
                    value={newCheckItem}
                    onChange={e => setNewCheckItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCheckItem()}
                  />
                  <button onClick={handleAddCheckItem} className="px-4 py-2 bg-[#0c56d0] text-white rounded-xl text-xs font-bold">Add</button>
                </div>
              )}

              <div className="space-y-4">
                {task.checklist?.length > 0 ? task.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => handleChecklistToggle(item.id, !item.done)}>
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${item.done ? "bg-[#0c56d0] border-[#0c56d0] text-white shadow-lg shadow-[#0c56d0]/20" : "border-[#abb3b7] group-hover:border-[#0c56d0]"}`}>
                      {item.done && <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>}
                    </div>
                    <span className={`text-[13px] font-medium transition-colors flex-1 ${item.done ? "text-[#abb3b7] line-through" : "text-[#2b3437]"}`}>
                      {item.text}
                    </span>
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#abb3b7] hover:text-[#9f403d] hover:bg-[#fe8983]/10 rounded-lg transition-all"
                      onClick={(e) => handleRemoveCheckItem(item.id, e)}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                )) : (
                  <p className="text-xs text-[#abb3b7] italic">No items yet</p>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#d97706]">attachment</span>
                  Attachments
                </h3>
                 <button 
                    onClick={() => setShowAddAttachment(!showAddAttachment)}
                    className="w-6 h-6 rounded-full bg-[#0c56d0] text-white flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm">{showAddAttachment ? 'close' : 'add'}</span>
                  </button>
              </div>

              {showAddAttachment && (
                <div className="mb-4 bg-white p-4 border border-[#eaeff1] rounded-2xl space-y-3 shadow-sm">
                  <input 
                    className="w-full bg-[#f8f9fa] border border-[#eaeff1] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0c56d0]"
                    placeholder="Name (e.g. GitHub Repo)"
                    value={newAttName}
                    onChange={e => setNewAttName(e.target.value)}
                  />
                  <input 
                    className="w-full bg-[#f8f9fa] border border-[#eaeff1] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0c56d0]"
                    placeholder="URL (https://...)"
                    value={newAttUrl}
                    onChange={e => setNewAttUrl(e.target.value)}
                  />
                  <button onClick={handleAddAttachment} className="w-full py-2 bg-[#0c56d0] text-white rounded-xl text-xs font-bold">Add Link</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.attachments?.length > 0 ? task.attachments.map((att) => (
                  <div key={att.id} className="relative flex items-center gap-4 p-4 bg-white border border-[#eaeff1] rounded-2xl hover:border-[#0c56d0] hover:shadow-md transition-all group">
                    <a href={att.url} target="_blank" rel="noreferrer" className="absolute inset-0 rounded-2xl z-0" />
                    <div className="w-11 h-11 bg-[#f1f4f6] rounded-xl flex items-center justify-center text-[#586064] group-hover:bg-[#dae2ff] group-hover:text-[#0c56d0] transition-colors relative z-10 pointer-events-none">
                      <span className="material-symbols-outlined">{att.icon || 'link'}</span>
                    </div>
                    <div className="min-w-0 flex-1 relative z-10 pointer-events-none">
                      <p className="text-sm font-bold text-[#2b3437] truncate">{att.name}</p>
                      <p className="text-[10px] font-medium text-[#abb3b7] uppercase tracking-tight">{att.subtitle}</p>
                    </div>
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-2 text-[#abb3b7] hover:text-[#9f403d] hover:bg-[#fe8983]/10 rounded-xl transition-all relative z-20"
                      onClick={(e) => handleRemoveAttachment(att.id, e)}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                )) : (
                  <p className="text-xs text-[#abb3b7] italic col-span-2">No attachments yet</p>
                )}
              </div>
            </div>

            {/* Testing Notes Card */}
            <div>
              <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#7c3aed]">description</span>
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
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#eaeff1] flex flex-col bg-white shrink-0">
          <div className="p-5 md:p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold text-[#586064] uppercase tracking-widest">Recent Activity</h3>
               <button className="p-2 hover:bg-[#f1f4f6] rounded-full transition-colors hidden md:block" onClick={onClose}>
                 <span className="material-symbols-outlined text-xl">close</span>
               </button>
            </div>

            <div className="space-y-8">
              {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => {
                const actorMember = project?.members.find(m => m.id === notif.actor_id);
                const actorName = actorMember?.username || notif.profiles?.username || 'Somebody';
                const actorInitial = actorName.slice(0, 2).toUpperCase();
                const isMe = notif.actor_id === currentUserId;
                const actorColor = isMe ? '#0c56d0' : getUserColor(actorName);
                
                return (
                 <div key={notif.id} className="flex gap-4 relative">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-md"
                    style={{ backgroundColor: actorColor }}
                  >
                    {isMe ? 'ME' : actorInitial}
                  </div>
                  <div>
                    <p className="text-[13px] leading-snug text-[#2b3437]">
                      <span className="font-bold" style={{ color: actorColor }}>{isMe ? 'You' : actorName}</span> {notif.content ? notif.content.split(' ').slice(1).join(' ') : 'updated something'}
                    </p>
                    <p className="text-[10px] text-[#abb3b7] mt-1 flex items-center gap-1 font-medium">
                       <span className="material-symbols-outlined text-[10px]">schedule</span>
                       {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                 </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                  <span className="material-symbols-outlined text-4xl mb-2">history</span>
                  <p className="text-xs">No activity log yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto p-5 md:p-8 border-t border-[#eaeff1] bg-[#f8f9fa]/50">
             <div className="bg-white p-5 rounded-2xl border border-dashed border-[#eaeff1] hover:border-[#0c56d0]/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-[#abb3b7] uppercase tracking-widest block">Sprint Goal</label>
                  {!editingSprintGoal && (
                    <button onClick={() => setEditingSprintGoal(true)} className="text-[#abb3b7] hover:text-[#0c56d0]">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  )}
                </div>
                {editingSprintGoal ? (
                  <div>
                    <textarea 
                      autoFocus
                      className="w-full bg-transparent border border-[#eaeff1] rounded text-[11px] leading-relaxed text-[#586064] outline-none focus:border-[#0c56d0] p-2 resize-y h-16 shadow-inner"
                      value={sprintGoal}
                      onChange={e => setSprintGoal(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                       <button onClick={handleSprintGoalSave} className="text-[10px] text-white bg-[#0c56d0] px-2 py-1 rounded font-bold shadow-sm">Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] leading-relaxed text-[#586064] font-medium" onClick={() => setEditingSprintGoal(true)}>
                    {project?.sprintGoal || "No sprint goal defined for this project. Click to add one."}
                  </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
