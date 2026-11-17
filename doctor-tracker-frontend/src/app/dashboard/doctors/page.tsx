"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Doctor, PaginatedData } from "@/types";

const empty = { name: "", specialization: "", hospital: "", phone: "", email: "" };

export default function DoctorsPage() {
  const [data, setData] = useState<PaginatedData<Doctor> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load(nextPage = page, nextSearch = search) {
    try {
      setData(await api<PaginatedData<Doctor>>(`/doctors?search=${encodeURIComponent(nextSearch)}&page=${nextPage}&limit=9`));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load doctors"); }
  }

  useEffect(() => { void load(page, search); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editing) {
        await api<Doctor>(`/doctors/${editing._id}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await api<Doctor>("/doctors", { method: "POST", body: JSON.stringify(form) });
      }
      setForm(empty);
      setEditing(null);
      setShow(false);
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save doctor"); }
  }

  function openEdit(doctor: Doctor) {
    setEditing(doctor);
    setForm({ name: doctor.name, specialization: doctor.specialization, hospital: doctor.hospital, phone: doctor.phone, email: doctor.email });
    setShow(true);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this doctor and all associated patients?")) return;
    try { await api(`/doctors/${id}`, { method: "DELETE" }); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete doctor"); }
  }

  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs text-slate-400">Medical directory</p><h1 className="mt-1 text-[25px] font-bold tracking-tight">Doctors</h1></div>
        <button onClick={() => { setEditing(null); setForm(empty); setShow(true); }} className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#246bfd] px-4 text-xs font-semibold text-white"><Plus className="h-4 w-4" />Add doctor</button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mb-4 flex items-center gap-2">
        <label className="flex h-11 max-w-[420px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setPage(1); void load(1, search); } }} placeholder="Search by name, specialty or hospital..." className="w-full bg-transparent text-xs outline-none" /></label>
        <button onClick={() => { setPage(1); void load(1, search); }} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold">Search</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((doctor, index) => (
          <article key={doctor._id} className="rounded-[14px] border border-slate-200/80 bg-white p-5 shadow-[0_5px_18px_rgba(15,23,42,.025)]">
            <div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${index % 3 === 0 ? "bg-[#edf4ff] text-[#246bfd]" : index % 3 === 1 ? "bg-[#eaf7f2] text-emerald-700" : "bg-[#fff1ec] text-orange-700"}`}>{doctor.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><button className="text-slate-300">•••</button></div>
            <Link href={`/dashboard/doctors/${doctor._id}`} className="mt-4 block truncate text-sm font-bold hover:text-[#246bfd]">{doctor.name}</Link>
            <p className="mt-1 text-xs text-slate-500">{doctor.specialization}</p>
            <div className="mt-4 space-y-2 rounded-xl bg-[#f8fafc] p-3 text-[11px]"><p className="flex justify-between gap-2 text-slate-400"><span>Hospital</span><span className="max-w-[140px] truncate font-semibold text-slate-700">{doctor.hospital}</span></p><p className="flex justify-between text-slate-400"><span>Phone</span><span className="font-semibold text-slate-700">{doctor.phone}</span></p></div>
            <div className="mt-4 flex items-center justify-between"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">Available</span><div className="flex gap-1"><button onClick={() => openEdit(doctor)} aria-label={`Edit ${doctor.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-[#246bfd]"><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => remove(doctor._id)} aria-label={`Delete ${doctor.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></div>
          </article>
        ))}
      </div>
      {!data?.items.length && <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">No doctors found</p>}
      {data && data.pagination.pages > 1 && <div className="mt-5 flex justify-end gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="flex h-9 items-center px-2 text-xs text-slate-500">{page} / {data.pagination.pages}</span><button disabled={page === data.pagination.pages} onClick={() => setPage(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>}
      {show && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit doctor" : "Add doctor"}</h2><button type="button" onClick={() => setShow(false)} className="text-slate-400">×</button></div><div className="grid gap-4 sm:grid-cols-2">{(["name","specialization","hospital","phone","email"] as const).map((field) => <label key={field} className="text-xs font-semibold capitalize">{field}<input required type={field === "email" ? "email" : "text"} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#246bfd]" /></label>)}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold">Cancel</button><button className="h-10 rounded-xl bg-[#246bfd] px-4 text-xs font-semibold text-white">{editing ? "Save changes" : "Create doctor"}</button></div></form></div>}
    </>
  );
}
