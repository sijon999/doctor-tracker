"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Plus, Search, Trash2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Appointment, Doctor, PaginatedData, Patient } from "@/types";

const empty = { patient: "", doctor: "", date: "", time: "", reason: "", status: "scheduled" };

export default function AppointmentsPage() {
  const [data, setData] = useState<PaginatedData<Appointment> | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", status, date });
      setData(await api<PaginatedData<Appointment>>(`/appointments?${params}`));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load appointments"); }
  }

  useEffect(() => {
    void load();
    void api<PaginatedData<Patient>>("/patients?limit=100").then((result) => setPatients(result.items)).catch(() => undefined);
    void api<PaginatedData<Doctor>>("/doctors?limit=100").then((result) => setDoctors(result.items)).catch(() => undefined);
  }, [page, status, date]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editing) await api(`/appointments/${editing._id}`, { method: "PATCH", body: JSON.stringify(form) });
      else await api("/appointments", { method: "POST", body: JSON.stringify(form) });
      setForm(empty); setEditing(null); setShow(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save appointment"); }
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment);
    setForm({
      patient: typeof appointment.patient === "object" ? appointment.patient._id : appointment.patient,
      doctor: typeof appointment.doctor === "object" ? appointment.doctor._id : appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setShow(true);
  }

  async function setAppointmentStatus(appointment: Appointment, nextStatus: Appointment["status"]) {
    try { await api(`/appointments/${appointment._id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) }); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update appointment"); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this appointment?")) return;
    try { await api(`/appointments/${id}`, { method: "DELETE" }); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete appointment"); }
  }

  const visibleItems = data?.items.filter((item) => {
    if (!search) return true;
    const patientName = typeof item.patient === "object" ? item.patient.name : "";
    const doctorName = typeof item.doctor === "object" ? item.doctor.name : "";
    return `${patientName} ${doctorName} ${item.reason}`.toLowerCase().includes(search.toLowerCase());
  }) ?? [];

  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs text-slate-400">Schedule and visits</p><h1 className="mt-1 text-[25px] font-bold tracking-tight">Appointments</h1></div>
        <button onClick={() => { setEditing(null); setForm(empty); setShow(true); }} className="flex h-10 items-center gap-2 rounded-[10px] bg-[#246bfd] px-4 text-xs font-semibold text-white"><Plus className="h-4 w-4" />New appointment</button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px]">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments..." className="w-full text-xs outline-none" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs"><option value="">All statuses</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs" />
      </div>
      <div className="overflow-hidden rounded-[14px] border border-slate-200/80 bg-white">
        <div className="hidden grid-cols-[1fr_1fr_130px_130px_110px_90px] border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:grid"><span>Patient</span><span>Doctor</span><span>Date</span><span>Time</span><span>Status</span><span>Actions</span></div>
        {visibleItems.map((appointment) => (
          <div key={appointment._id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-[1fr_1fr_130px_130px_110px_90px] md:items-center">
            <div><p className="text-xs font-bold">{typeof appointment.patient === "object" ? appointment.patient.name : "Unknown patient"}</p><p className="mt-1 text-[10px] text-slate-400">{appointment.reason}</p></div>
            <p className="text-xs text-slate-600">{typeof appointment.doctor === "object" ? appointment.doctor.name : "Unknown doctor"}</p>
            <p className="flex items-center gap-2 text-xs"><CalendarDays className="h-3.5 w-3.5 text-[#246bfd]" />{appointment.date}</p>
            <p className="text-xs">{appointment.time}</p>
            <select value={appointment.status} onChange={(event) => setAppointmentStatus(appointment, event.target.value as Appointment["status"])} className={`h-8 rounded-full px-2 text-[10px] font-bold ${appointment.status === "completed" ? "bg-emerald-50 text-emerald-600" : appointment.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
            <div className="flex gap-1"><button onClick={() => openEdit(appointment)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#246bfd]"><CheckCircle2 className="h-3.5 w-3.5" /></button><button onClick={() => remove(appointment._id)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div>
          </div>
        ))}
        {!visibleItems.length && <p className="p-12 text-center text-sm text-slate-400">No appointments found</p>}
      </div>
      {show && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-xl rounded-[18px] bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit appointment" : "New appointment"}</h2><button type="button" onClick={() => setShow(false)}><XCircle className="h-5 w-5 text-slate-400" /></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Patient<select required value={form.patient} onChange={(event) => setForm({ ...form, patient: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"><option value="">Select patient</option>{patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name}</option>)}</select></label><label className="text-xs font-semibold">Doctor<select required value={form.doctor} onChange={(event) => setForm({ ...form, doctor: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}</select></label><label className="text-xs font-semibold">Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal" /></label><label className="text-xs font-semibold">Time<input required type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal" /></label><label className="text-xs font-semibold sm:col-span-2">Reason<input required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Consultation reason" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold">Cancel</button><button className="h-10 rounded-xl bg-[#246bfd] px-4 text-xs font-semibold text-white">{editing ? "Save changes" : "Create appointment"}</button></div></form></div>}
    </>
  );
}
