"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const supabase = createClient();

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      setError("Username is already taken. Try another.");
      setLoading(false);
      return;
    }

    // Sign up
    const { data, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().trim(),
          full_name: fullName.trim(),
        },
      },
    });

    if (signupErr) {
      setError(signupErr.message);
      setLoading(false);
      return;
    }

    // Insert profile row
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: username.toLowerCase().trim(),
        full_name: fullName.trim(),
      });
    }

    router.push("/projects");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#0c56d0]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl primary-gradient flex items-center justify-center text-white shadow-xl mx-auto mb-5"
            style={{ boxShadow: "0 12px 32px rgba(12,86,208,0.3)" }}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
            ZENDO
          </h1>
          <p className="text-[#737c7f] text-sm mt-1">Create your workspace</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#eaeff1] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(43,52,55,0.12)]" style={{ boxShadow: "0 8px 32px rgba(43,52,55,0.04)" }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2b3437] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Get started</h2>
            <p className="text-[#737c7f] text-sm">Create your professional profile today.</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#586064] uppercase tracking-widest block mb-2 opacity-70">Username</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#abb3b7] font-bold">@</span>
                  <input
                    autoFocus
                    type="text"
                    className="w-full pl-9 pr-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-[#0c56d0]/20 transition-all font-medium"
                    placeholder="bleu"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value.replace(/\s/g, "").toLowerCase()); setError(""); }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#586064] uppercase tracking-widest block mb-2 opacity-70">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-[#0c56d0]/20 transition-all font-medium"
                  placeholder="Alex Rivera"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(""); }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#586064] uppercase tracking-widest block mb-2 opacity-70">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#abb3b7] text-xl group-focus-within:text-[#0c56d0] transition-colors">mail</span>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-[#0c56d0]/20 transition-all font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#586064] uppercase tracking-widest block mb-2 opacity-70">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#abb3b7] text-xl group-focus-within:text-[#0c56d0] transition-colors">lock</span>
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 bg-[#f1f4f6] border-2 border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-[#0c56d0]/20 transition-all font-medium"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737c7f] hover:text-[#2b3437] transition-colors"
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
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#737c7f] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0c56d0] font-bold hover:underline">
              Sign in
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
