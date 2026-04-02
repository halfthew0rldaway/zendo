"use client";

import { useState } from "react";
import CalendarClient from "./CalendarClient";
import ScheduleClient from "./ScheduleClient";

export default function CalendarPage() {
  const [tab, setTab] = useState<"calendar" | "schedule">("calendar");

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#f8f9fa]">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 px-5 md:px-10 pt-4 md:pt-6 pb-0 bg-white border-b border-[#e3e9ec] overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setTab("calendar")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all duration-200 ${
            tab === "calendar"
              ? "border-[#0c56d0] text-[#0c56d0]"
              : "border-transparent text-[#586064] hover:text-[#2b3437] hover:bg-[#f1f4f6] rounded-t-xl"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" style={tab === "calendar" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            calendar_month
          </span>
          Calendar
        </button>
        <button
          onClick={() => setTab("schedule")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all duration-200 ${
            tab === "schedule"
              ? "border-[#0c56d0] text-[#0c56d0]"
              : "border-transparent text-[#586064] hover:text-[#2b3437] hover:bg-[#f1f4f6] rounded-t-xl"
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
