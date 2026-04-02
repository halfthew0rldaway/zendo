"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/projects");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#dae2ff]/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e3dbfd]/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl primary-gradient flex items-center justify-center text-white shadow-xl mx-auto mb-5"
            style={{ boxShadow: "0 12px 32px rgba(12,86,208,0.3)" }}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
            ZENDO
          </h1>
          <p className="text-[#737c7f] text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="bg-white rounded-2xl p-8 ghost-border" style={{ boxShadow: "0 8px 32px rgba(43,52,55,0.08)" }}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#586064] uppercase tracking-widest block mb-2">Email</label>
              <input
                autoFocus
                type="email"
                className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#586064] uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-[#0c56d0]/40 transition-all pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737c7f] hover:text-[#2b3437]"
                  onClick={() => setShowPw(v => !v)}>
                  <span className="material-symbols-outlined text-xl">{showPw ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#fe8983]/10 border border-[#fe8983]/30 rounded-xl px-4 py-3 text-sm text-[#9f403d] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full primary-gradient text-white font-bold py-4 rounded-xl text-sm active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
              style={{ boxShadow: "0 8px 24px rgba(12,86,208,0.25)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#737c7f] mt-6">
            No account?{" "}
            <Link href="/signup" className="text-[#0c56d0] font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-[#abb3b7] uppercase tracking-widest mt-8">
          Zendo © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
