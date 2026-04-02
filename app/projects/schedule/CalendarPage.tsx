"use client";

import { useState } from "react";
import CalendarClient from "./CalendarClient";
import ScheduleClient from "./ScheduleClient";

export default function CalendarPage() {
  const [tab, setTab] = useState<"calendar" | "schedule">("calendar");

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      {/* Tab switcher */}
      <div className={`flex items-center gap-1 px-10 pt-6 pb-0 ${tab === "calendar" ? "bg-[#0f1117]" : "bg-[#f8f9fa]"} transition-colors duration-300`}>
        <button
          onClick={() => setTab("calendar")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all duration-200 ${
            tab === "calendar"
              ? "bg-[#1a1d27] text-white"
              : "text-[#586064] hover:text-[#2b3437] bg-transparent"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" style={tab === "calendar" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            calendar_month
          </span>
          Calendar
        </button>
        <button
          onClick={() => setTab("schedule")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all duration-200 ${
            tab === "schedule"
              ? "bg-[#f8f9fa] text-[#2b3437]"
              : "text-white/40 hover:text-white/80 bg-transparent"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" style={tab === "schedule" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            view_list
          </span>
          Task List
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "calendar" ? <CalendarClient /> : <ScheduleClient />}
      </div>
    </div>
  );
}
