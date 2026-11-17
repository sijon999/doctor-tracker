"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
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
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", search, condition, doctor: doctorFilter });
      setData(await api<PaginatedData<Patient>>(`/patients?${params}`));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load patients"); }
  }

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10", search, condition, doctor: doctorFilter });
    api<PaginatedData<Patient>>(`/patients?${params}`)
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load patients"));
    void api<PaginatedData<Doctor>>("/doctors?limit=100").then((result) => setDoctors(result.items)).catch(() => undefined);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api<Patient>("/patients", {
        method: "POST",
        body: JSON.stringify({ ...form, age: Number(form.age), gender: form.gender || undefined, email: form.email || undefined }),
      });
      setForm(empty); setShow(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to create patient"); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this patient?")) return;
    try { await api(`/patients/${id}`, { method: "DELETE" }); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete patient"); }
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">Patient records</p><h1 className="text-2xl font-semibold">Patients</h1></div><button onClick={() => setShow(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add patient</button></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px_180px_auto]"><label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients..." className="w-full outline-none" /></label><input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Condition" className="h-11 rounded-xl border border-slate-200 bg-white px-3" /><select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3"><option value="">All doctors</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}</select><button onClick={() => { setPage(1); void load(); }} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm">Filter</button></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Patient</th><th className="px-5 py-4">Doctor</th><th className="px-5 py-4">Condition</th><th className="px-5 py-4">Age</th><th className="px-5 py-4">Actions</th></tr></thead><tbody>{data?.items.map((patient) => <tr key={patient._id} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4"><Link href={`/dashboard/patients/${patient._id}`} className="font-semibold text-blue-700">{patient.name}</Link><p className="text-xs text-slate-500">{patient.phone}</p></td><td className="px-5 py-4">{typeof patient.doctor === "object" ? patient.doctor.name : "-"}</td><td className="px-5 py-4">{patient.condition}</td><td className="px-5 py-4">{patient.age}</td><td className="px-5 py-4"><button onClick={() => remove(patient._id)} className="text-red-600">Delete</button></td></tr>)}</tbody></table>{!data?.items.length && <p className="p-10 text-center text-sm text-slate-500">No patients found</p>}</div>
      {data && data.pagination.pages > 1 && <div className="mt-4 flex justify-end gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page === data.pagination.pages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>}
      {show && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"><form onSubmit={createPatient} className="w-full max-w-xl rounded-2xl bg-white p-6"><h2 className="mb-5 text-xl font-semibold">Add patient</h2><div className="grid gap-4 sm:grid-cols-2">{(["name","email","phone","age","condition"] as const).map((field) => <label key={field} className="text-sm font-medium capitalize">{field}<input required={field !== "email"} type={field === "email" ? "email" : field === "age" ? "number" : "text"} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none" /></label>)}<label className="text-sm font-medium">Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label className="text-sm font-medium">Doctor<select required value={form.doctor} onChange={(event) => setForm({ ...form, doctor: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="rounded-xl border px-4 py-2.5 text-sm">Cancel</button><button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Create patient</button></div></form></div>}
    </>
  );
}
