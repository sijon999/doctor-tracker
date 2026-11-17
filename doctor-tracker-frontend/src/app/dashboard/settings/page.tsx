"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Application</h2>
        <p className="mt-2 text-sm text-slate-500">Doctor Tracker is connected to its backend API and uses a secure HTTP-only authentication cookie.</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm"><dt className="text-slate-500">Environment</dt><dd>Local development</dd><dt className="text-slate-500">Session</dt><dd>JWT cookie</dd></dl>
      </section>
    </div>
  );
}
