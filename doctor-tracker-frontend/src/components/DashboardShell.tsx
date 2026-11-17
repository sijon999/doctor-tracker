"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, Bell, CalendarDays, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, Stethoscope, Sun, UsersRound, X } from "lucide-react";
import { api } from "@/lib/api";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/dashboard/patients", label: "Patients", icon: UsersRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("doctor-tracker-theme");
    const nextDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(nextDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", dark);
  }, [dark]);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    localStorage.setItem("doctor-tracker-theme", nextDark ? "dark" : "light");
  }

  useEffect(() => {
    api<{ id: string }>("/auth/me").then(() => setChecking(false)).catch(() => router.replace("/login"));
  }, [router]);

  async function logout() {
    await api<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm text-slate-500">Checking session...</div>;
  }

  return (
    <div className={`min-h-screen bg-[#f4f7fb] text-[#172033] ${dark ? "dark-theme" : ""}`}>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[248px] border-r border-slate-200/80 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[72px] items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#246bfd] text-white shadow-[0_8px_18px_rgba(36,107,253,.22)]"><Activity className="h-5 w-5" /></div>
            <div><p className="text-[15px] font-bold tracking-tight">Doctor<span className="text-[#246bfd]">Tracker</span></p></div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="px-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Main menu</p>
          {navigation.map((item) => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`mb-1 flex h-11 items-center gap-3 rounded-[10px] px-3.5 text-[13px] transition ${active ? "bg-[#edf4ff] font-semibold text-[#246bfd]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><item.icon className="h-[17px] w-[17px]" />{item.label}{item.href === "/dashboard/appointments" && <span className="ml-auto rounded-md bg-[#246bfd] px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>}</Link>;
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-3">
          <div className="mb-2 rounded-2xl bg-[#eef5ff] p-3">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#246bfd] shadow-sm"><Activity className="h-4 w-4" /></div>
            <p className="text-xs font-bold">Care center</p><p className="mt-1 text-[10px] leading-4 text-slate-500">All systems are operating normally</p>
          </div>
          <button onClick={logout} className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[13px] text-slate-500 hover:bg-slate-50"><LogOut className="h-[17px] w-[17px]" />Logout</button>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-slate-200/70 bg-white/95 px-4 backdrop-blur sm:px-7">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <label className="hidden h-10 w-full max-w-[360px] items-center gap-2 rounded-xl border border-slate-200 bg-[#fafbfc] px-3 md:flex"><Search className="h-4 w-4 text-slate-400" /><input placeholder="Search patients, doctors..." className="w-full bg-transparent text-xs outline-none" /></label>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleTheme} aria-label={dark ? "Use light mode" : "Use dark mode"} title={dark ? "Light mode" : "Dark mode"} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:text-[#246bfd]">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500"><CalendarDays className="h-4 w-4" /></button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
            <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce8ff] text-xs font-bold text-[#246bfd]">AD</div><div className="hidden sm:block"><p className="text-xs font-bold">Administrator</p><p className="text-[10px] text-slate-400">Care Guide BD</p></div></div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
