"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Doctor, PaginatedData, Patient } from "@/types";

const empty = { name: "", email: "", phone: "", age: "", gender: "", condition: "", doctor: "" };

export default function PatientsPage() {
  const [data, setData] = useState<PaginatedData<Patient> | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load(nextPage = page) {
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: "9", search, condition, doctor: doctorFilter });
      setData(await api<PaginatedData<Patient>>(`/patients?${params}`));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load patients"); }
  }

  useEffect(() => {
    void load(page);
    void api<PaginatedData<Doctor>>("/doctors?limit=100").then((result) => setDoctors(result.items)).catch(() => undefined);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const body = { ...form, age: Number(form.age), gender: form.gender || undefined, email: form.email || undefined };
      if (editing) await api<Patient>(`/patients/${editing._id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await api<Patient>("/patients", { method: "POST", body: JSON.stringify(body) });
      setForm(empty); setEditing(null); setShow(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save patient"); }
  }

  function openEdit(patient: Patient) {
    setEditing(patient);
    setForm({
      name: patient.name,
      email: patient.email ?? "",
      phone: patient.phone,
      age: String(patient.age),
      gender: patient.gender ?? "",
      condition: patient.condition,
      doctor: typeof patient.doctor === "object" ? patient.doctor._id : patient.doctor,
    });
    setShow(true);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this patient?")) return;
    try { await api(`/patients/${id}`, { method: "DELETE" }); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete patient"); }
  }

  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs text-slate-400">Patient records</p><h1 className="mt-1 text-[25px] font-bold tracking-tight">Patients</h1></div>
        <button onClick={() => { setEditing(null); setForm(empty); setShow(true); }} className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#246bfd] px-4 text-xs font-semibold text-white"><Plus className="h-4 w-4" />Add patient</button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_180px_auto]">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setPage(1); void load(1); } }} placeholder="Search patients..." className="w-full text-xs outline-none" /></label>
        <input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Condition" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs" />
        <select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs"><option value="">All doctors</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}</select>
        <button onClick={() => { setPage(1); void load(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold">Filter</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((patient, index) => (
          <article key={patient._id} className="rounded-[14px] border border-slate-200/80 bg-white p-5 shadow-[0_5px_18px_rgba(15,23,42,.025)]">
            <div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${index % 3 === 0 ? "bg-[#edf4ff] text-[#246bfd]" : index % 3 === 1 ? "bg-[#fff1ec] text-orange-700" : "bg-[#eaf7f2] text-emerald-700"}`}>{patient.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-bold text-sky-600">{patient.age} yrs</span></div>
            <Link href={`/dashboard/patients/${patient._id}`} className="mt-4 block truncate text-sm font-bold hover:text-[#246bfd]">{patient.name}</Link>
            <p className="mt-1 text-xs text-slate-500">{patient.condition}</p>
            <div className="mt-4 space-y-2 rounded-xl bg-[#f8fafc] p-3 text-[11px]"><p className="flex justify-between text-slate-400"><span>Doctor</span><span className="font-semibold text-slate-700">{typeof patient.doctor === "object" ? patient.doctor.name : "-"}</span></p><p className="flex justify-between text-slate-400"><span>Phone</span><span className="font-semibold text-slate-700">{patient.phone}</span></p></div>
            <div className="mt-4 flex justify-end gap-1"><button onClick={() => openEdit(patient)} aria-label={`Edit ${patient.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-[#246bfd]"><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => remove(patient._id)} aria-label={`Delete ${patient.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div>
          </article>
        ))}
      </div>
      {!data?.items.length && <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">No patients found</p>}
      {data && data.pagination.pages > 1 && <div className="mt-5 flex justify-end gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="flex h-9 items-center px-2 text-xs text-slate-500">{page} / {data.pagination.pages}</span><button disabled={page === data.pagination.pages} onClick={() => setPage(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>}
      {show && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-xl rounded-[18px] bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit patient" : "Add patient"}</h2><button type="button" onClick={() => setShow(false)} className="text-slate-400">×</button></div><div className="grid gap-4 sm:grid-cols-2">{(["name","email","phone","age","condition"] as const).map((field) => <label key={field} className="text-xs font-semibold capitalize">{field}<input required={field !== "email"} type={field === "email" ? "email" : field === "age" ? "number" : "text"} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#246bfd]" /></label>)}<label className="text-xs font-semibold">Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label className="text-xs font-semibold">Doctor<select required value={form.doctor} onChange={(event) => setForm({ ...form, doctor: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold">Cancel</button><button className="h-10 rounded-xl bg-[#246bfd] px-4 text-xs font-semibold text-white">{editing ? "Save changes" : "Create patient"}</button></div></form></div>}
    </>
  );
}
