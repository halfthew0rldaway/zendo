"use client";

import { useProjects } from "../../lib/store";

export default function AnalyticsClient() {
  const { projects } = useProjects();

  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const doneTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === "done").length, 0);
  const inProgressTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === "in_progress").length, 0);
  
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="px-5 py-6 md:px-10 md:py-10 flex-grow">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          Analytics Overview
        </h1>
        <p className="text-[#4d626c] text-base">
          Insights and progress across all your tracked projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 ghost-border">
          <p className="text-xs font-bold text-[#737c7f] uppercase tracking-widest mb-2">Total Projects</p>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#0c56d0]">folder</span>
            <p className="text-4xl font-black text-[#2b3437]">{totalProjects}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 ghost-border">
          <p className="text-xs font-bold text-[#737c7f] uppercase tracking-widest mb-2">Tasks Created</p>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#615b77]">task</span>
            <p className="text-4xl font-black text-[#2b3437]">{totalTasks}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 ghost-border">
          <p className="text-xs font-bold text-[#737c7f] uppercase tracking-widest mb-2">In Progress</p>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#92400e]">pending_actions</span>
            <p className="text-4xl font-black text-[#2b3437]">{inProgressTasks}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 ghost-border relative overflow-hidden">
          <p className="text-xs font-bold text-[#737c7f] uppercase tracking-widest mb-2 relative z-10">Completion Rate</p>
          <div className="flex items-center gap-3 relative z-10">
            <span className="material-symbols-outlined text-4xl text-[#0c56d0]">incomplete_circle</span>
            <p className="text-4xl font-black text-[#2b3437]">{completionRate}%</p>
          </div>
          <div 
            className="absolute bottom-0 left-0 h-1 bg-[#0c56d0] transition-all duration-1000" 
            style={{ width: `${completionRate}%` }} 
          />
        </div>
      </div>

      {projects.length > 0 && (
        <div className="bg-white rounded-xl p-6 ghost-border">
          <h2 className="text-lg font-bold text-[#2b3437] mb-6">Project Progress Breakdown</h2>
          <div className="space-y-6">
            {projects.map(p => {
              const pTasks = p.tasks.length;
              const pDone = p.tasks.filter(t => t.status === "done").length;
              const pPercent = pTasks > 0 ? Math.round((pDone / pTasks) * 100) : 0;
              return (
                <div key={p.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-[#2b3437]">{p.name}</span>
                    <span className="text-xs font-bold text-[#737c7f]">{pDone} / {pTasks} tasks ({pPercent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#e3e9ec] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0c56d0] transition-all duration-500" style={{ width: `${pPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
