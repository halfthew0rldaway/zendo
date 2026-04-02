"use client";

export default function HelpClient() {
  const faqs = [
    { q: "How do I create a project?", a: "Click 'Create New' in the sidebar or the '+' fab button on the Projects page. Fill in the name, icon, color theme, and an optional security PIN." },
    { q: "What is a security PIN?", a: "A 4–6 digit PIN that locks a project. Anyone opening the project must enter the correct PIN first. The PIN is stored locally on your device." },
    { q: "How do I add tasks to a board?", a: "Open a project's Kanban board, then click the '+' button next to any column header (To Do, In Progress, etc.) to create a new task in that column." },
    { q: "Can I move tasks between columns?", a: "Yes. You can drag and drop task cards across columns, or click on a task to open its detail drawer and change its status from the dropdown." },
    { q: "How does the Schedule view work?", a: "Schedule aggregates all tasks from all your accessible (unlocked) projects in one list. Use filters to narrow by status, priority, or specific project." },
    { q: "How do I export my data?", a: "Open Settings (gear icon in the top bar) and click 'Export data as JSON'. This downloads a backup file of all your projects and team members." },
    { q: "How do I add team members?", a: "Go to the Team page via the sidebar. Click 'Add Member', fill in name, role, email, and pick an avatar color." },
    { q: "Is my data stored in the cloud?", a: "Currently all data is stored locally in your browser's localStorage. Use the Export feature to back up your data." },
  ];

  return (
    <div className="px-5 py-6 md:px-10 md:py-10 flex-grow max-w-4xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          Help & FAQ
        </h1>
        <p className="text-[#4d626c] text-base">
          Answers to common questions about Zendo Zendo.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "add_circle", title: "Create Project", desc: "Start a new project", href: "/projects/new" },
          { icon: "group", title: "Manage Team", desc: "Add or edit members", href: "/projects/team" },
          { icon: "view_kanban", title: "Open Board", desc: "Jump to kanban view", href: "/projects/board" },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="bg-white rounded-xl p-5 ghost-border hover:shadow-lg transition-all flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-[#dae2ff] text-[#0c56d0] flex items-center justify-center">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <p className="font-bold text-sm text-[#2b3437]">{item.title}</p>
              <p className="text-xs text-[#737c7f]">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-white rounded-xl ghost-border overflow-hidden">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-semibold text-[#2b3437] text-sm hover:bg-[#f1f4f6] transition-colors">
              {faq.q}
              <span className="material-symbols-outlined text-[#737c7f] transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="px-6 pb-5 text-sm text-[#586064] leading-relaxed border-t border-[#f1f4f6] pt-4">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
