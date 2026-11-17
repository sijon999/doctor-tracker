"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, Download, Stethoscope, TrendingDown, TrendingUp, UserRound, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import type { Doctor, PaginatedData, Patient } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, newPatients: 0 });
  const [overTime, setOverTime] = useState<{ date: string; count: number }[]>([]);
  const [perDoctor, setPerDoctor] = useState<{ name: string; count: number }[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<typeof stats>("/dashboard/stats"),
      api<{ date: string; count: number }[]>("/dashboard/patients-over-time"),
      api<{ name: string; count: number }[]>("/dashboard/patients-per-doctor"),
      api<PaginatedData<Doctor>>("/doctors?limit=5"),
      api<PaginatedData<Patient>>("/patients?limit=5"),
    ]).then(([nextStats, nextOverTime, nextPerDoctor, doctorData, patientData]) => {
      setStats(nextStats);
      setOverTime(nextOverTime);
      setPerDoctor(nextPerDoctor);
      setDoctors(doctorData.items);
      setPatients(patientData.items);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load analytics"));
  }, []);

  const cards = [
    { label: "Total Patients", value: stats.totalPatients, icon: UsersRound, trend: "+12.5%", tone: "text-emerald-600", up: true },
    { label: "Active Doctors", value: stats.totalDoctors, icon: Stethoscope, trend: "+8.2%", tone: "text-emerald-600", up: true },
    { label: "New Patients", value: stats.newPatients, icon: UserRound, trend: "-3.4%", tone: "text-red-500", up: false },
    { label: "Appointments", value: 96, icon: CalendarDays, trend: "+5.8%", tone: "text-emerald-600", up: true },
  ];

  function exportReport() {
    const lines = ["Metric,Value", ...cards.map((card) => `${card.label},${card.value}`)];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "doctor-tracker-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-5 flex items-end justify-between">
        <div><p className="text-xs font-medium text-slate-400">Monday, 18 November</p><h1 className="mt-1 text-[25px] font-bold tracking-tight">Dashboard overview</h1></div>
        <button onClick={exportReport} className="flex h-10 items-center gap-2 rounded-[10px] bg-[#246bfd] px-4 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(36,107,253,.18)]"><Download className="h-4 w-4" />Export report</button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[14px] border border-slate-200/80 bg-white p-4 shadow-[0_5px_18px_rgba(15,23,42,.025)]">
            <div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4ff] text-[#246bfd]"><card.icon className="h-[18px] w-[18px]" /></div><button className="text-slate-300">•••</button></div>
            <p className="mt-4 text-xs text-slate-500">{card.label}</p>
            <div className="mt-1 flex items-end justify-between"><p className="text-[27px] font-bold leading-none">{card.value}</p><span className={`flex items-center gap-1 text-[10px] font-semibold ${card.tone}`}>{card.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{card.trend}</span></div>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <article className="rounded-[14px] border border-slate-200/80 bg-white p-5">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold">Patient inflow</h2><p className="mt-1 text-[10px] text-slate-400">Monthly patient registrations</p></div><select className="h-8 rounded-lg border border-slate-200 px-2 text-[10px]"><option>Last 12 months</option><option>Last 6 months</option></select></div>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={overTime}><defs><linearGradient id="patientFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#246bfd" stopOpacity={0.18}/><stop offset="95%" stopColor="#246bfd" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f7" /><XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="count" stroke="#246bfd" strokeWidth={2} fill="url(#patientFill)" /></AreaChart></ResponsiveContainer></div>
        </article>
        <article className="rounded-[14px] border border-slate-200/80 bg-white p-5">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold">Doctor workload</h2><p className="mt-1 text-[10px] text-slate-400">Patients assigned</p></div><button className="text-slate-300">•••</button></div>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={perDoctor.slice(0, 6)}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f7" /><XAxis dataKey="name" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#246bfd" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="rounded-[14px] border border-slate-200/80 bg-white p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">Recent doctors</h2><a href="/dashboard/doctors" className="text-[10px] font-semibold text-[#246bfd]">View all</a></div>
          <div className="divide-y divide-slate-100">{doctors.map((doctor, index) => <div key={doctor._id} className="flex items-center gap-3 py-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${index % 2 ? "bg-[#eaf7f2] text-emerald-700" : "bg-[#edf4ff] text-[#246bfd]"}`}>{doctor.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{doctor.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{doctor.specialization}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">Active</span></div>)}</div>
        </article>
        <article className="rounded-[14px] border border-slate-200/80 bg-white p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">New patients</h2><a href="/dashboard/patients" className="text-[10px] font-semibold text-[#246bfd]">View all</a></div>
          <div className="divide-y divide-slate-100">{patients.map((patient, index) => <div key={patient._id} className="flex items-center gap-3 py-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${index % 2 ? "bg-[#fff1ec] text-orange-700" : "bg-[#edf4ff] text-[#246bfd]"}`}>{patient.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{patient.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{patient.condition}</p></div><span className="rounded-full bg-sky-50 px-2 py-1 text-[9px] font-semibold text-sky-600">{patient.age} yrs</span></div>)}</div>
        </article>
      </section>
    </>
  );
}
