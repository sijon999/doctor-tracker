"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Doctor, Patient } from "@/types";

export default function DoctorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const result = await api<{ doctor: Doctor; patients: Patient[] }>(`/doctors/${id}`);
      setDoctor(result.doctor); setPatients(result.patients);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load doctor"); }
  }

  useEffect(() => {
    api<{ doctor: Doctor; patients: Patient[] }>(`/doctors/${id}`)
      .then((result) => { setDoctor(result.doctor); setPatients(result.patients); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load doctor"));
  }, [id]);

  async function removePatient(patientId: string) {
    if (!window.confirm("Remove this patient?")) return;
    try { await api(`/patients/${patientId}`, { method: "DELETE" }); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to remove patient"); }
  }

  if (!doctor) return <p className="text-sm text-slate-500">{error || "Loading doctor..."}</p>;
  return (
    <>
      <Link href="/dashboard/doctors" className="mb-5 inline-block text-sm text-blue-700">← Back to doctors</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">{doctor.name}</h1><p className="mt-1 text-blue-700">{doctor.specialization}</p><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Hospital</dt><dd className="mt-1 font-medium">{doctor.hospital}</dd></div><div><dt className="text-slate-500">Phone</dt><dd className="mt-1 font-medium">{doctor.phone}</dd></div><div><dt className="text-slate-500">Email</dt><dd className="mt-1 font-medium">{doctor.email}</dd></div></dl></section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-4 font-semibold">Associated patients ({patients.length})</h2>{patients.length ? <div className="space-y-2">{patients.map((patient) => <div key={patient._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-medium">{patient.name}</p><p className="text-xs text-slate-500">{patient.condition}</p></div><button onClick={() => removePatient(patient._id)} className="text-sm text-red-600">Remove</button></div>)}</div> : <p className="text-sm text-slate-500">No patients associated with this doctor.</p>}</section>
    </>
  );
}
