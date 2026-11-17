"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, LayoutDashboard, LogOut, Menu, Settings, Stethoscope, UsersRound, X } from "lucide-react";
import { api } from "@/lib/api";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/dashboard/patients", label: "Patients", icon: UsersRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);

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
    <div className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-7">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Activity className="h-5 w-5" /></div>
            <div><p className="font-semibold">Doctor Tracker</p><p className="text-xs text-slate-500">Care Guide BD</p></div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-4">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><item.icon className="h-[18px] w-[18px]" />{item.label}</Link>;
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-100 p-4">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"><LogOut className="h-[18px] w-[18px]" />Logout</button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">AD</div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
