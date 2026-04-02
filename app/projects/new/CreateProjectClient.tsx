"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "../../lib/store";
import { Project } from "../../types";

type IconBg = "primary" | "secondary" | "tertiary";

const ICON_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "eco", label: "Eco" },
  { value: "museum", label: "Museum" },
  { value: "architecture", label: "Architecture" },
  { value: "domain", label: "Domain" },
  { value: "corporate_fare", label: "Corporate" },
  { value: "foundation", label: "Foundation" },
  { value: "location_city", label: "City" },
];

const COLOR_OPTIONS: { value: IconBg; label: string; classes: string }[] = [
  { value: "primary", label: "Blue", classes: "bg-[#dae2ff] text-[#0c56d0]" },
  {
    value: "secondary",
    label: "Teal",
    classes: "bg-[#cfe6f2] text-[#4d626c]",
  },
  {
    value: "tertiary",
    label: "Purple",
    classes: "bg-[#e3dbfd] text-[#615b77]",
  },
];

export default function CreateProjectClient() {
  const router = useRouter();
  const { addProject } = useProjects();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [icon, setIcon] = useState("apartment");
  const [iconBg, setIconBg] = useState<IconBg>("primary");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPinText, setShowPinText] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Project name is required.";
    if (pin && (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin))) {
      newErrors.pin = "PIN must be 4–6 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const project = await addProject({
      name: name.trim(),
      description: description.trim(),
      pin: pin.trim() || null,
      icon,
      iconBg,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });

    if (project) {
      router.push(`/projects/${project.id}/board`);
    } else {
      setErrors({ name: "Failed to create project. Please try again." });
      setSubmitting(false);
    }
  };

  const selectedColor = COLOR_OPTIONS.find((c) => c.value === iconBg);

  return (
    <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-[#dae2ff]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#e3dbfd]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        <div
          className="bg-white rounded-xl p-8 md:p-12 relative border border-[#abb3b7]/10"
          style={{ boxShadow: "0 12px 32px rgba(43,52,55,0.06)" }}
        >
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1
              className="font-extrabold text-4xl tracking-tight text-[#2b3437] mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Initialize Project
            </h1>
            <p className="text-[#586064] text-lg leading-relaxed">
              Establish the structural foundation for your new workspace.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Project Name */}
              <div className="flex flex-col gap-2 group">
                <label
                  className="text-sm font-semibold tracking-wide text-[#586064] ml-1"
                  htmlFor="project-name"
                >
                  Project Name
                </label>
                <input
                  className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg focus:bg-white focus:border-[#0c56d0]/40 transition-all outline-none"
                  id="project-name"
                  placeholder="E.g. Zenith Skyscraper"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-xs text-[#9f403d] ml-1">{errors.name}</p>
                )}
              </div>

              {/* Icon Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-[#586064] ml-1">
                  Project Icon
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${selectedColor?.classes}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                  </div>
                  <select
                    className="flex-1 px-3 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg focus:bg-white focus:border-[#0c56d0]/40 transition-all outline-none text-sm"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 group md:col-span-2">
                <label
                  className="text-sm font-semibold tracking-wide text-[#586064] ml-1"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg focus:bg-white focus:border-[#0c56d0]/40 transition-all outline-none resize-none"
                  id="description"
                  placeholder="Briefly outline the project scope and primary objectives..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2 group md:col-span-2">
                <label className="text-sm font-semibold tracking-wide text-[#586064] ml-1">
                  Project Deadline (Optional)
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg focus:bg-white focus:border-[#0c56d0]/40 transition-all outline-none"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-[#586064] ml-1">
                  Color Theme
                </label>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setIconBg(color.value)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${color.classes} ${
                        iconBg === color.value
                          ? "ring-2 ring-offset-2 ring-[#0c56d0]"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN */}
              <div className="flex flex-col gap-2 group">
                <label
                  className="text-sm font-semibold tracking-wide text-[#586064] ml-1"
                  htmlFor="pin"
                >
                  Security PIN{" "}
                  <span className="font-normal text-[#737c7f]">(Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-lg focus:bg-white focus:border-[#0c56d0]/40 transition-all outline-none tracking-[0.5em] pr-12"
                    id="pin"
                    maxLength={6}
                    placeholder="4-6 digits"
                    type={showPinText ? "text" : "password"}
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-4 text-[#737c7f] hover:text-[#2b3437] transition-colors"
                    onClick={() => setShowPinText((v) => !v)}
                  >
                    <span className="material-symbols-outlined">
                      {showPinText ? "visibility_off" : "lock"}
                    </span>
                  </button>
                </div>
                {errors.pin && (
                  <p className="text-xs text-[#9f403d] ml-1">{errors.pin}</p>
                )}
                <p className="text-xs text-[#737c7f] mt-1 ml-1">
                  Used for high-priority authorization tasks.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <button
                className="text-[#0c56d0] font-bold px-6 py-3 hover:bg-[#0c56d0]/5 rounded-full transition-all active:scale-95"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                className="primary-gradient text-white font-bold px-10 py-4 rounded-full active:scale-95 transition-all text-lg flex items-center gap-3"
                style={{ boxShadow: "0 8px 24px rgba(12,86,208,0.2)" }}
                type="submit"
              >
                <span>Create Project</span>
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[#586064]/60 text-xs uppercase tracking-[0.2em]">
          <span className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px" }}
            >
              verified_user
            </span>{" "}
            Secure Cloud Storage
          </span>
          <span className="w-1 h-1 bg-[#abb3b7]/40 rounded-full" />
          <span className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px" }}
            >
              sync
            </span>{" "}
            Real-time Sync
          </span>
        </div>
      </div>
    </main>
  );
}
