"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Doctor, PaginatedData } from "@/types";

const empty = { name: "", specialization: "", hospital: "", phone: "", email: "" };

export default function DoctorsPage() {
  const [data, setData] = useState<PaginatedData<Doctor> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    try {
      setData(await api<PaginatedData<Doctor>>(`/doctors?search=${encodeURIComponent(search)}&page=${page}&limit=10`));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load doctors"); }
  }

  useEffect(() => {
    api<PaginatedData<Doctor>>(`/doctors?search=${encodeURIComponent(search)}&page=${page}&limit=10`)
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load doctors"));
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api<Doctor>("/doctors", { method: "POST", body: JSON.stringify(form) });
      setForm(empty); setShow(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to create doctor"); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this doctor and all associated patients?")) return;
    try { await api(`/doctors/${id}`, { method: "DELETE" }); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete doctor"); }
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">Medical directory</p><h1 className="text-2xl font-semibold">Doctors</h1></div><button onClick={() => setShow(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add doctor</button></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mb-4 flex gap-2"><label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} placeholder="Search doctors..." className="w-full outline-none" /></label><button onClick={() => { setPage(1); void load(); }} className="rounded-xl border border-slate-200 bg-white px-4 text-sm">Search</button></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Doctor</th><th className="px-5 py-4">Hospital</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Actions</th></tr></thead><tbody>{data?.items.map((doctor) => <tr key={doctor._id} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4"><Link href={`/dashboard/doctors/${doctor._id}`} className="font-semibold text-blue-700">{doctor.name}</Link><p className="text-xs text-slate-500">{doctor.specialization}</p></td><td className="px-5 py-4">{doctor.hospital}</td><td className="px-5 py-4">{doctor.phone}</td><td className="px-5 py-4"><button onClick={() => remove(doctor._id)} className="text-red-600">Delete</button></td></tr>)}</tbody></table>
        {!data?.items.length && <p className="p-10 text-center text-sm text-slate-500">No doctors found</p>}
      </div>
      {data && data.pagination.pages > 1 && <div className="mt-4 flex justify-end gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page === data.pagination.pages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>}
      {show && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"><form onSubmit={createDoctor} className="w-full max-w-lg rounded-2xl bg-white p-6"><h2 className="mb-5 text-xl font-semibold">Add doctor</h2><div className="grid gap-4 sm:grid-cols-2">{(["name","specialization","hospital","phone","email"] as const).map((field) => <label key={field} className="text-sm font-medium capitalize">{field}<input required type={field === "email" ? "email" : "text"} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none" /></label>)}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="rounded-xl border px-4 py-2.5 text-sm">Cancel</button><button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Create doctor</button></div></form></div>}
    </>
  );
}
