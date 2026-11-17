"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Activity, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api<{ id: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#edf3fb] px-4">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#dceaff]" />
      <div className="absolute -bottom-40 -right-24 h-[430px] w-[430px] rounded-full bg-[#dde9fb]" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-[420px] rounded-[24px] border border-white/80 bg-white p-8 shadow-[0_24px_70px_rgba(34,65,108,.12)]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#246bfd] text-white shadow-[0_8px_18px_rgba(36,107,253,.22)]"><Activity className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold">DoctorTracker</h1><p className="text-xs text-slate-500">Healthcare management portal</p></div>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="mb-4 block text-xs font-semibold text-slate-700">Email address<div className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-[#246bfd]"><Mail className="h-4 w-4 text-slate-400" /><input name="email" type="email" required placeholder="admin@example.com" className="w-full text-sm font-normal outline-none" /></div></label>
        <label className="mb-2 block text-xs font-semibold text-slate-700">Password<div className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-[#246bfd]"><LockKeyhole className="h-4 w-4 text-slate-400" /><input name="password" type={showPassword ? "text" : "password"} required minLength={12} placeholder="Enter your password" className="w-full text-sm font-normal outline-none" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}</button></div></label>
        <button disabled={loading} className="mt-5 h-12 w-full rounded-xl bg-[#246bfd] text-sm font-bold text-white shadow-[0_10px_24px_rgba(36,107,253,.22)] disabled:opacity-60">{loading ? "Signing in..." : "Sign in to dashboard"}</button>
      </form>
    </main>
  );
}
