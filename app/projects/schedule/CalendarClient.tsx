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
  todo: "bg-[#64748b]",
  in_progress: "bg-[#6366f1]",
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
    <div className="flex-grow flex flex-col h-full bg-[#0f1117] text-white">
      {/* Top bar */}
      <div className="px-10 pt-10 pb-6 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-[#6366f1]" style={{ fontVariationSettings: "'FILL' 1" }}>
                calendar_month
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                Calendar
              </h1>
            </div>
            <p className="text-white/40 text-sm">Deadlines and task due dates across all your projects.</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: "Events", value: totalEvents, color: "text-[#6366f1]" },
              { label: "Overdue", value: overdueEvents, color: "text-[#f87171]" },
              { label: "This week", value: upcomingEvents, color: "text-[#34d399]" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</p>
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
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <h2 className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatMonth(year, month)}
            </h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-white/20 uppercase tracking-widest py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Leading blanks */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square rounded-xl" />
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
                  className={`aspect-square rounded-xl p-1.5 flex flex-col items-start transition-all relative group text-left ${
                    isSelected
                      ? "bg-[#6366f1]/20 ring-2 ring-[#6366f1]"
                      : isToday
                      ? "bg-[#6366f1]/10 ring-1 ring-[#6366f1]/40"
                      : "hover:bg-white/5"
                  } ${isPast && !isToday ? "opacity-50" : ""}`}
                >
                  <span className={`text-[13px] font-bold mb-1 ${
                    isToday ? "text-[#6366f1]" : "text-white/70 group-hover:text-white/90"
                  }`}>
                    {day}
                  </span>

                  {/* Event dots */}
                  <div className="flex flex-wrap gap-0.5">
                    {events.slice(0, 4).map((ev, ei) => (
                      <span
                        key={ei}
                        className={`w-1.5 h-1.5 rounded-full ${
                          ev.type === "project" ? "bg-[#f59e0b]" : STATUS_DOT[ev.status ?? "todo"]
                        }`}
                      />
                    ))}
                    {events.length > 4 && (
                      <span className="text-[8px] text-white/30 font-bold leading-none self-end">
                        +{events.length - 4}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span className="text-[11px] text-white/20 uppercase tracking-widest font-bold">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-[11px] text-white/40">Project deadline</span>
            </div>
            {(Object.entries(STATUS_DOT) as [TaskStatus, string][]).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                <span className="text-[11px] text-white/40">{STATUS_LABEL[status]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-80 shrink-0 border-l border-white/5 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">
              {selectedDay
                ? new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "Select a day"}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {!selectedDay && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                <span className="material-symbols-outlined text-5xl">touch_app</span>
                <p className="text-sm text-center">Click a date on the calendar to see events for that day.</p>
              </div>
            )}

            {selectedDay && selectedEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                <span className="material-symbols-outlined text-4xl">event_available</span>
                <p className="text-sm text-center">No events on this day.</p>
              </div>
            )}

            {selectedEvents.map((ev, i) => (
              <Link
                key={i}
                href={`/projects/${ev.projectId}/board`}
                className={`block p-4 rounded-xl border transition-all group hover:scale-[1.01] ${
                  ev.type === "project"
                    ? "bg-[#f59e0b]/10 border-[#f59e0b]/20 hover:bg-[#f59e0b]/15"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {ev.type === "project" ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
                      <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest">Project Deadline</span>
                    </>
                  ) : (
                    <>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[ev.status ?? "todo"]}`} />
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {STATUS_LABEL[ev.status ?? "todo"]}
                      </span>
                    </>
                  )}
                </div>
                <p className={`text-sm font-semibold truncate ${ev.type === "project" ? "text-[#f59e0b]" : "text-white/90"}`}>
                  {ev.title}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5 truncate">{ev.projectName}</p>
              </Link>
            ))}
          </div>

          {/* Upcoming events section */}
          <div className="border-t border-white/5 p-6">
            <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Coming up</h4>
            <div className="space-y-2">
              {(() => {
                const upcoming: Array<{ dateStr: string; ev: CalendarEvent }> = [];
                for (let d = 0; d <= 14; d++) {
                  const date = new Date(today);
                  date.setDate(date.getDate() + d);
                  const ds = isoDate(date.getFullYear(), date.getMonth(), date.getDate());
                  (eventMap[ds] ?? []).forEach(ev => upcoming.push({ dateStr: ds, ev }));
                }
                if (upcoming.length === 0) return (
                  <p className="text-xs text-white/20">Nothing in the next 2 weeks.</p>
                );
                return upcoming.slice(0, 5).map(({ dateStr, ev }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.type === "project" ? "bg-[#f59e0b]" : STATUS_DOT[ev.status ?? "todo"]}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-white/70 font-medium truncate">{ev.title}</p>
                      <p className="text-[10px] text-white/25">
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
