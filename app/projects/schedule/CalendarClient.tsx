"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useProjects } from "../../lib/store";
import { Task, TaskStatus } from "../../types";

// ── helpers ──────────────────────────────────────────────────────────────────
function formatMonth(year: number, month: number) {
  return new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toIsoDay(iso: string) {
  return iso.substring(0, 10);
}

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-[#abb3b7]",
  in_progress: "bg-[#0c56d0]",
  review: "bg-[#0ea5e9]",
  testing: "bg-[#a855f7]",
  done: "bg-[#22c55e]",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  testing: "Testing",
  done: "Done",
};

interface CalendarEvent {
  type: "task" | "project";
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status?: TaskStatus;
  isDeadline?: boolean;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function CalendarClient() {
  const { projects, unlockedProjectIds } = useProjects();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build event map: date-string → events
  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};

    const add = (dateStr: string, ev: CalendarEvent) => {
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    };

    projects.forEach((p) => {
      const accessible = !p.pin || unlockedProjectIds.has(p.id);

      // Project deadline
      if (p.dueDate) {
        add(toIsoDay(p.dueDate), {
          type: "project",
          id: p.id,
          title: p.name,
          projectId: p.id,
          projectName: p.name,
          isDeadline: true,
        });
      }

      if (!accessible) return;

      // Task due dates
      p.tasks.forEach((t) => {
        if (t.dueDate) {
          add(toIsoDay(t.dueDate), {
            type: "task",
            id: t.id,
            title: t.title,
            projectId: p.id,
            projectName: p.name,
            status: t.status,
          });
        }
      });
    });

    return map;
  }, [projects, unlockedProjectIds]);

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const selectedEvents = selectedDay ? (eventMap[selectedDay] ?? []) : [];

  // Stats
  const totalEvents = Object.values(eventMap).flat().length;
  const overdueEvents = Object.entries(eventMap).flatMap(([date, evs]) =>
    date < todayStr ? evs.filter(e => e.status !== "done" && e.type === "task") : []
  ).length;
  const upcomingEvents = Object.entries(eventMap).flatMap(([date, evs]) =>
    date >= todayStr && date <= isoDate(today.getFullYear(), today.getMonth(), today.getDate() + 7) ? evs : []
  ).length;

  return (
    <div className="flex-grow flex flex-col h-full bg-[#f8f9fa] text-[#2b3437]">
      {/* Top bar */}
      <div className="px-10 pt-10 pb-6 border-b border-[#e3e9ec] bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-[#0c56d0]" style={{ fontVariationSettings: "'FILL' 1" }}>
                calendar_month
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                Calendar Overview
              </h1>
            </div>
            <p className="text-[#586064] text-sm">Deadlines and task due dates across all your projects.</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 bg-[#f1f4f6] px-6 py-3 rounded-xl border border-[#e3e9ec]">
            {[
              { label: "Events", value: totalEvents, color: "text-[#0c56d0]" },
              { label: "Overdue", value: overdueEvents, color: "text-[#9f403d]" },
              { label: "This week", value: upcomingEvents, color: "text-[#004ab9]" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-[#737c7f] font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main calendar */}
        <div className="flex-1 overflow-y-auto p-10">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-full bg-white border border-[#e3e9ec] hover:bg-[#f1f4f6] flex items-center justify-center transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg text-[#586064]">chevron_left</span>
            </button>
            <h2 className="text-2xl font-bold text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatMonth(year, month)}
            </h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full bg-white border border-[#e3e9ec] hover:bg-[#f1f4f6] flex items-center justify-center transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg text-[#586064]">chevron_right</span>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-[#586064] uppercase tracking-widest py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-3">
            {/* Leading blanks */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square rounded-xl bg-transparent" />
            ))}

            {/* Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dateStr = isoDate(year, month, day);
              const events = eventMap[dateStr] ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;
              const isPast = dateStr < todayStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`aspect-square rounded-xl p-2 flex flex-col items-start transition-all relative group text-left border ${
                    isSelected
                      ? "bg-[#0c56d0]/5 border-[#0c56d0] ring-2 ring-[#0c56d0]/20 shadow-sm"
                      : isToday
                      ? "bg-white border-[#0c56d0]/40 shadow-sm"
                      : "bg-white border-[#e3e9ec] hover:bg-[#f8f9fa] hover:border-[#abb3b7]/40 hover:shadow-sm"
                  } ${isPast && !isToday ? "opacity-60 bg-[#f8f9fa]" : ""}`}
                >
                  <span className={`text-sm font-bold mb-2 ${
                    isToday ? "text-[#0c56d0]" : "text-[#4d626c] group-hover:text-[#2b3437]"
                  }`}>
                    {day}
                  </span>

                  {/* Event dots */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {events.slice(0, 4).map((ev, ei) => (
                      <span
                        key={ei}
                        className={`w-2 h-2 rounded-full shadow-sm ${
                          ev.type === "project" ? "bg-[#f59e0b]" : STATUS_DOT[ev.status ?? "todo"]
                        }`}
                      />
                    ))}
                    {events.length > 4 && (
                      <span className="text-[9px] text-[#737c7f] font-bold leading-none self-end ml-0.5">
                        +{events.length - 4}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center gap-5 bg-white p-4 rounded-xl border border-[#e3e9ec]">
            <span className="text-[11px] text-[#737c7f] uppercase tracking-widest font-bold">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-sm" />
              <span className="text-[11px] font-semibold text-[#586064]">Project deadline</span>
            </div>
            {(Object.entries(STATUS_DOT) as [TaskStatus, string][]).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${cls}`} />
                <span className="text-[11px] font-semibold text-[#586064]">{STATUS_LABEL[status]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-80 shrink-0 border-l border-[#e3e9ec] bg-white flex flex-col overflow-hidden shadow-[-4px_0_16px_rgba(43,52,55,0.02)] z-10">
          <div className="p-6 border-b border-[#e3e9ec] bg-[#f8f9fa]">
            <h3 className="text-sm font-extrabold text-[#2b3437] uppercase tracking-widest">
              {selectedDay
                ? new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "Select a day"}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {!selectedDay && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[#abb3b7]">
                <span className="material-symbols-outlined text-5xl">touch_app</span>
                <p className="text-sm text-center font-medium">Click a date on the calendar to see events for that day.</p>
              </div>
            )}

            {selectedDay && selectedEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[#abb3b7]">
                <span className="material-symbols-outlined text-4xl">event_available</span>
                <p className="text-sm text-center font-medium">No events on this day.</p>
              </div>
            )}

            {selectedEvents.map((ev, i) => (
              <Link
                key={i}
                href={`/projects/${ev.projectId}/board`}
                className={`block p-4 rounded-xl border transition-all group hover:scale-[1.01] shadow-sm hover:shadow-md ${
                  ev.type === "project"
                    ? "bg-[#fffbeb] border-[#fde68a] hover:bg-[#fef3c7]"
                    : "bg-white border-[#e3e9ec] hover:border-[#0c56d0]/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {ev.type === "project" ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
                      <span className="text-[10px] font-bold text-[#b45309] uppercase tracking-widest">Project Deadline</span>
                    </>
                  ) : (
                    <>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[ev.status ?? "todo"]}`} />
                      <span className="text-[10px] font-bold text-[#586064] uppercase tracking-widest">
                        {STATUS_LABEL[ev.status ?? "todo"]}
                      </span>
                    </>
                  )}
                </div>
                <p className={`text-sm font-bold truncate ${ev.type === "project" ? "text-[#92400e]" : "text-[#2b3437]"}`}>
                  {ev.title}
                </p>
                <p className={`text-[11px] truncate mt-0.5 ${ev.type === "project" ? "text-[#b45309]/80" : "text-[#586064]"}`}>
                  {ev.projectName}
                </p>
              </Link>
            ))}
          </div>

          {/* Upcoming events section */}
          <div className="border-t border-[#e3e9ec] bg-[#f8f9fa] p-6">
            <h4 className="text-[11px] font-bold text-[#737c7f] uppercase tracking-widest mb-4">Coming up</h4>
            <div className="space-y-3">
              {(() => {
                const upcoming: Array<{ dateStr: string; ev: CalendarEvent }> = [];
                for (let d = 0; d <= 14; d++) {
                  const date = new Date(today);
                  date.setDate(date.getDate() + d);
                  const ds = isoDate(date.getFullYear(), date.getMonth(), date.getDate());
                  (eventMap[ds] ?? []).forEach(ev => upcoming.push({ dateStr: ds, ev }));
                }
                if (upcoming.length === 0) return (
                  <p className="text-xs text-[#abb3b7] font-medium">Nothing in the next 2 weeks.</p>
                );
                return upcoming.slice(0, 5).map(({ dateStr, ev }, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#e3e9ec]">
                    <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${ev.type === "project" ? "bg-[#f59e0b]" : STATUS_DOT[ev.status ?? "todo"]}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#2b3437] font-bold truncate">{ev.title}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#737c7f] mt-0.5">
                        {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
