"use client";

import { useState } from "react";
import { useProjects } from "../../lib/store";
import { TeamMember } from "../../types";
import ConfirmModal from "../../components/ConfirmModal";

const MEMBER_COLORS = [
  "#0c56d0", "#615b77", "#4d626c", "#9f403d", "#004aba",
  "#554f6b", "#415660", "#2d424c", "#3f3a54",
];

const ROLES = [
  "Lead Developer", "Frontend Engineer", "Backend Engineer",
  "UI Designer", "QA Engineer", "Project Manager",
  "DevOps Engineer", "Product Owner", "Data Engineer",
];

function MemberCard({ member, onRemove, onEdit }: {
  member: TeamMember;
  onRemove: (id: string) => void;
  onEdit: (member: TeamMember) => void;
}) {
  const [hover, setHover] = useState(false);
  const joined = new Date(member.joinedAt);
  const monthYear = joined.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div
      className="bg-white rounded-xl p-5 ghost-border hover:shadow-xl hover:shadow-black/5 transition-all group flex flex-col gap-4"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
          style={{ backgroundColor: member.color }}
        >
          {member.initials}
        </div>
        <div className={`flex gap-1 transition-opacity ${hover ? "opacity-100" : "opacity-0"}`}>
          <button
            className="p-1.5 rounded-lg hover:bg-[#f1f4f6] transition-colors text-[#586064]"
            onClick={() => onEdit(member)}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[#fe8983]/20 transition-colors text-[#586064] hover:text-[#9f403d]"
            onClick={() => onRemove(member.id)}
          >
            <span className="material-symbols-outlined text-lg">person_remove</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-[#2b3437] text-base" style={{ fontFamily: "Outfit, sans-serif" }}>
          {member.name}
        </h3>
        <p className="text-sm text-[#586064]">{member.role}</p>
      </div>

      <div className="pt-4 border-t border-[#f1f4f6] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#737c7f]">
          <span className="material-symbols-outlined text-sm">mail</span>
          <span className="truncate max-w-[130px]">{member.email}</span>
        </div>
        <span className="text-[10px] font-bold text-[#737c7f] uppercase tracking-wider">
          Since {monthYear}
        </span>
      </div>
    </div>
  );
}

function MemberFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: TeamMember;
  onSave: (data: Omit<TeamMember, "id" | "joinedAt">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? ROLES[0]);
  const [email, setEmail] = useState(initial?.email ?? "");
  const [color, setColor] = useState(initial?.color ?? MEMBER_COLORS[0]);
  const [error, setError] = useState("");

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Valid email is required."); return; }
    onSave({ name: name.trim(), role, email: email.trim(), initials, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" style={{ boxShadow: "0 24px 48px rgba(43,52,55,0.12)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
            {initial ? "Edit Member" : "Add Member"}
          </h2>
          <button className="p-1 hover:bg-[#e3e9ec] rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Preview avatar */}
          <div className="flex items-center gap-4 p-4 bg-[#f1f4f6] rounded-xl">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow"
              style={{ backgroundColor: color }}
            >
              {initials || "?"}
            </div>
            <div>
              <p className="font-semibold text-[#2b3437] text-sm">{name || "Member name"}</p>
              <p className="text-xs text-[#586064]">{role}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-1">Full Name</label>
            <input
              autoFocus
              className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40"
              placeholder="E.g. Alex Rivera"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-1">Role</label>
            <select
              className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-1">Email</label>
            <input
              className="w-full px-3 py-2.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40"
              placeholder="email@studio.com"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#586064] block mb-2">Avatar Color</label>
            <div className="flex gap-2 flex-wrap">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-[#0c56d0] scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-[#9f403d]">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button className="flex-1 px-4 py-2.5 rounded-full border border-[#e3e9ec] text-sm font-semibold text-[#586064] hover:bg-[#f1f4f6]" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="flex-1 primary-gradient text-white px-4 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-all" type="submit">
              {initial ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamClient() {
  const { members, addMember, removeMember, updateMember } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleSave = (data: Omit<TeamMember, "id" | "joinedAt">) => {
    if (editingMember) {
      updateMember(editingMember.id, data);
    } else {
      addMember(data);
    }
    setEditingMember(undefined);
  };

  const handleRemove = (id: string) => {
    setConfirmRemoveId(id);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const roles = [...new Set(members.map((m) => m.role))];

  return (
    <div className="px-10 py-10 flex-grow">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            Team
          </h1>
          <p className="text-[#4d626c] text-base">
            {members.length} member{members.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <button
          className="primary-gradient text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          style={{ boxShadow: "0 8px 24px rgba(12,86,208,0.2)" }}
          onClick={() => { setEditingMember(undefined); setShowForm(true); }}
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Member
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {[
          { label: "Total Members", value: members.length, icon: "group" },
          { label: "Roles", value: roles.length, icon: "badge" },
        ].map((s) => (
          <div key={s.label} className="bg-white px-5 py-4 rounded-xl ghost-border flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0c56d0]">{s.icon}</span>
            <div>
              <p className="font-extrabold text-xl text-[#2b3437]">{s.value}</p>
              <p className="text-[11px] text-[#737c7f]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Members grid grouped by role */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-5xl text-[#abb3b7]">group</span>
          <p className="font-medium text-[#586064]">No team members yet.</p>
          <button
            className="primary-gradient text-white px-6 py-3 rounded-full font-bold text-sm"
            onClick={() => setShowForm(true)}
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {roles.map((role) => (
            <div key={role}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#737c7f] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">badge</span>
                {role}
                <span className="text-[#abb3b7]">({members.filter((m) => m.role === role).length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members
                  .filter((m) => m.role === role)
                  .map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onRemove={handleRemove}
                      onEdit={handleEdit}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <MemberFormModal
          initial={editingMember}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingMember(undefined); }}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmRemoveId && (
        <ConfirmModal
          title="Remove Member"
          message="Are you sure you want to remove this team member from the workspace? This action cannot be undone."
          confirmText="Remove"
          onCancel={() => setConfirmRemoveId(null)}
          onConfirm={() => {
            removeMember(confirmRemoveId);
            setConfirmRemoveId(null);
          }}
        />
      )}
    </div>
  );
}
