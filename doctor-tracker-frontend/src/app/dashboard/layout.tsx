import { Suspense, type ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm text-slate-500">Loading dashboard...</div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
