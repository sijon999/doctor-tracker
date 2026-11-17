"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Activity } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><Activity className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-semibold">Doctor Tracker</h1><p className="text-sm text-slate-500">Administrator sign in</p></div>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="mb-4 block text-sm font-medium">Email<input name="email" type="email" required className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500" /></label>
        <label className="mb-6 block text-sm font-medium">Password<input name="password" type="password" required minLength={12} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500" /></label>
        <button disabled={loading} className="h-11 w-full rounded-xl bg-blue-600 font-semibold text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );
}
