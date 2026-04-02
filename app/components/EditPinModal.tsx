"use client";

import { useState } from "react";
import { Project } from "../types";
import { useProjects } from "../lib/store";

export default function EditPinModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { updateProject } = useProjects();
  const [pin, setPin] = useState("");
  const [showPinText, setShowPinText] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEnabled = project.pin !== null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin && (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin))) {
      setError("PIN must be 4–6 digits.");
      return;
    }

    setSubmitting(true);
    await updateProject(project.id, { pin: pin || null });
    setSubmitting(false);
    onClose();
  };

  const handleDisable = async () => {
    setSubmitting(true);
    await updateProject(project.id, { pin: null });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl relative" style={{ boxShadow: "0 24px 48px rgba(43,52,55,0.12)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
            Edit Project PIN
          </h2>
          <button className="p-1 hover:bg-[#e3e9ec] rounded-full transition-colors" onClick={onClose} disabled={submitting}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold tracking-wide text-[#586064] ml-1" htmlFor="pin">
              New Security PIN
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full px-4 py-3 bg-[#f1f4f6] border-2 border-transparent rounded-lg focus:bg-white focus:border-[#0c56d0]/40 transition-all outline-none tracking-[0.5em] pr-12 text-center text-lg font-bold"
                id="pin"
                maxLength={6}
                placeholder="4-6 digits"
                type={showPinText ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={submitting}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-4 text-[#737c7f] hover:text-[#2b3437] transition-colors"
                onClick={() => setShowPinText((v) => !v)}
              >
                <span className="material-symbols-outlined">{showPinText ? "visibility_off" : "lock"}</span>
              </button>
            </div>
            {error && <p className="text-xs text-[#9f403d] ml-1">{error}</p>}
            <p className="text-[11px] text-[#737c7f] mt-1 ml-1 leading-relaxed">
              Updating the PIN will immediately secure the project board. Leave empty and save if you want to remove the PIN.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full primary-gradient text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? "Saving..." : "Save PIN"}
            </button>
            
            {isEnabled && (
              <button
                type="button"
                onClick={handleDisable}
                disabled={submitting}
                className="w-full py-3 rounded-lg font-bold text-[#9f403d] bg-[#fe8983]/10 hover:bg-[#fe8983]/20 transition-all text-sm"
              >
                Disable PIN Protection
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
