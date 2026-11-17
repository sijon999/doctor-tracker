"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Stethoscope, UserRound, UsersRound } from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, newPatients: 0 });
  const [overTime, setOverTime] = useState<{ date: string; count: number }[]>([]);
  const [perDoctor, setPerDoctor] = useState<{ name: string; count: number }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<typeof stats>("/dashboard/stats"),
      api<{ date: string; count: number }[]>("/dashboard/patients-over-time"),
      api<{ name: string; count: number }[]>("/dashboard/patients-per-doctor"),
    ]).then(([nextStats, nextOverTime, nextPerDoctor]) => {
      setStats(nextStats); setOverTime(nextOverTime); setPerDoctor(nextPerDoctor);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load analytics"));
  }, []);

  const cards = [
    { label: "Total Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "bg-blue-50 text-blue-600" },
    { label: "Total Patients", value: stats.totalPatients, icon: UsersRound, color: "bg-emerald-50 text-emerald-600" },
    { label: "New Patients", value: stats.newPatients, icon: UserRound, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <>
      <div className="mb-6"><p className="text-sm font-medium text-blue-600">Workspace / Overview</p><h1 className="mt-1 text-2xl font-semibold">Dashboard overview</h1></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}><card.icon className="h-5 w-5" /></div><p className="text-sm text-slate-500">{card.label}</p><p className="mt-1 text-3xl font-semibold">{card.value}</p></article>)}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-5 font-semibold">Patients over time</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={overTime}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="count" stroke="#2563eb" fill="#dbeafe" /></AreaChart></ResponsiveContainer></div></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-5 font-semibold">Patients per doctor</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={perDoctor}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
      </section>
    </>
  );
}
