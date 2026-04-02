"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "../../../lib/store";

interface PinAccessClientProps {
  projectId: string;
}

export default function PinAccessClient({ projectId }: PinAccessClientProps) {
  const router = useRouter();
  const { projects, unlockProject } = useProjects();
  const project = projects.find((p) => p.id === projectId);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pinLength = project?.pin?.length ?? 4;

  useEffect(() => {
    if (!project) {
      router.push("/projects");
    }
  }, [project, router]);

  if (!project) return null;

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(false);

    if (digit && index < pinLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = digits.slice(0, pinLength).join("");
    if (entered === project.pin) {
      unlockProject(projectId);
      router.push(`/projects/${projectId}/board`);
    } else {
      setError(true);
      setShake(true);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#dae2ff] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-[#cfe6f2] rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1
            className="font-black text-4xl tracking-tighter text-[#0c56d0] mb-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            ZENDO
          </h1>
          <p className="text-[#586064] font-medium tracking-tight">
            Secure Project Access
          </p>
        </div>

        {/* Card */}
        <section
          className="bg-white rounded-2xl p-8 md:p-10 ghost-border"
          style={{ boxShadow: "0 32px 64px -12px rgba(43,52,55,0.06)" }}
        >
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f1f4f6] rounded-2xl mb-4">
              <span className="material-symbols-outlined text-[#0c56d0] text-3xl">
                lock
              </span>
            </div>
            <h2
              className="font-bold text-2xl text-[#2b3437] tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Unlock Project
            </h2>
            <p className="text-[#586064] text-sm mt-2 font-medium">
              {project.name} — enter your secure access PIN
            </p>
          </header>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* PIN digits */}
            <div
              aria-label="PIN Input"
              className={`flex justify-between gap-2 sm:gap-3 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
              role="group"
              style={
                shake
                  ? {
                      animation: "shake 0.5s ease-in-out",
                    }
                  : undefined
              }
            >
              {Array.from({ length: pinLength }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl transition-all outline-none ${
                    error
                      ? "bg-[#ff00001a] border-2 border-[#9f403d]/20 text-[#9f403d] ring-2 ring-[#9f403d]/20"
                      : "bg-[#f1f4f6] border-none focus:ring-2 focus:ring-[#0c56d0]/40 focus:bg-white"
                  }`}
                  maxLength={1}
                  type="password"
                  value={digits[i]}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-[#9f403d] px-1">
                <span className="material-symbols-outlined text-[18px] mt-0.5">
                  error
                </span>
                <p className="text-xs font-semibold leading-tight">
                  Incorrect PIN. Please verify and try again.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              className="w-full primary-gradient text-white font-bold py-4 rounded-xl text-sm active:scale-95 transition-all"
              style={{
                boxShadow: "0 8px 24px rgba(12,86,208,0.25)",
              }}
              type="submit"
            >
              Unlock Project
            </button>
          </form>

          <footer className="mt-8 pt-8 flex items-center justify-between border-t border-[#eaeff1]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[#737c7f] font-bold">
                Lost Access?
              </span>
              <button className="text-[#0c56d0] font-bold text-xs hover:underline decoration-2 underline-offset-4">
                Ask project owner
              </button>
            </div>
            <div className="flex gap-4">
              <button className="text-[#586064] hover:text-[#2b3437] transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <button className="text-[#586064] hover:text-[#2b3437] transition-colors">
                <span className="material-symbols-outlined">fingerprint</span>
              </button>
            </div>
          </footer>
        </section>

        {/* Contextual details */}
        <div className="mt-12 grid grid-cols-2 gap-6 opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#eaeff1] overflow-hidden shrink-0 flex items-center justify-center text-[#737c7f]">
              <span className="material-symbols-outlined text-sm">
                {project.icon}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#737c7f] uppercase tracking-wider">
                Target Project
              </p>
              <p className="text-xs font-semibold text-[#2b3437]">
                {project.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#737c7f] uppercase tracking-wider">
                Encrypted By
              </p>
              <p className="text-xs font-semibold text-[#2b3437]">AES-256 Vault</p>
            </div>
            <span className="material-symbols-outlined text-[#737c7f]">
              verified_user
            </span>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
