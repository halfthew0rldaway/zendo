"use client";

import { useState } from "react";
import { useProjects } from "../../../lib/store";

interface InviteModalProps {
  projectId: string;
  onClose: () => void;
}

export default function InviteModal({ projectId, onClose }: InviteModalProps) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Member");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const { updateProject, projects } = useProjects();
  const project = projects.find(p => p.id === projectId);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !project) return;
    setStatus("loading");

    // Simulate network delay and update member count
    setTimeout(() => {
      updateProject(projectId, { memberCount: project.memberCount + 1 });
      setStatus("success");
      setTimeout(onClose, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl"
        style={{ boxShadow: "0 24px 48px rgba(43,52,55,0.12)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
            Invite to Project
          </h2>
          <button className="p-1 hover:bg-[#e3e9ec] rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {status === "success" ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-[#22c55e]/10 text-[#22c55e] rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <p className="font-bold text-[#2b3437]">Invitation Sent!</p>
            <p className="text-sm text-[#737c7f] text-center">They will be added to the project members once they accept.</p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#586064] block mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#abb3b7] font-bold">@</span>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-8 pr-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all font-medium"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-[#586064] block mb-1">Access Role</label>
              <select
                className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer (Read-only)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || status === "loading"}
              className="w-full primary-gradient text-white py-3 rounded-lg text-sm font-bold active:scale-95 transition-all mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>Send Invite <span className="material-symbols-outlined text-sm">send</span></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
