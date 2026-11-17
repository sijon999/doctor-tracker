"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Patient } from "@/types";

export default function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Patient>(`/patients/${id}`).then(setPatient).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load patient"));
  }, [id]);

  if (!patient) return <p className="text-sm text-slate-500">{error || "Loading patient..."}</p>;
  const doctor = typeof patient.doctor === "object" ? patient.doctor : null;
  return (
    <>
      <Link href="/dashboard/patients" className="mb-5 inline-block text-sm text-blue-700">← Back to patients</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">{patient.name}</h1><p className="mt-1 text-blue-700">{patient.condition}</p><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Age</dt><dd className="mt-1 font-medium">{patient.age}</dd></div><div><dt className="text-slate-500">Phone</dt><dd className="mt-1 font-medium">{patient.phone}</dd></div><div><dt className="text-slate-500">Email</dt><dd className="mt-1 font-medium">{patient.email || "Not provided"}</dd></div><div><dt className="text-slate-500">Gender</dt><dd className="mt-1 font-medium">{patient.gender || "Not specified"}</dd></div><div><dt className="text-slate-500">Doctor</dt><dd className="mt-1 font-medium">{doctor?.name || "-"}</dd></div></dl></section>
    </>
  );
}
