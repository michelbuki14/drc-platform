"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";

export default function CustomerServicePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"tickets" | "new" | "analytics" | "staff">("tickets");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="bg-white border-b border-[var(--color-border)] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">{t('cs.title')}</h1>
          </div>
          <nav className="flex gap-2">
            {(["tickets", "new", "analytics", "staff"] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === tabKey ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:bg-gray-100"}`}>
                {tabKey === "tickets" ? t("cs.tabs.tickets") : tabKey === "new" ? t("cs.tabs.new") : tabKey === "analytics" ? t("cs.tabs.analytics") : t("cs.tabs.staff")}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tab === "tickets" && <TicketsTab />}
        {tab === "new" && <NewTicketTab />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "staff" && <StaffTab />}
      </main>
    </div>
  );
}

function TicketsTab() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  return (
    <div className="flex gap-3 mb-6 flex-wrap">
      {(["all", "open", "closed"] as const).map(f => (
        <button key={f} onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? "bg-[var(--color-primary)] text-white" : "bg-white text-[var(--color-text-muted)] border border-[var(--color-border)]"}`}>
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

function NewTicketTab() {
  const { t } = useI18n();
  const [form, setForm] = useState({ type: "general", priority: "normal", summary: "", email: "" });
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[var(--color-border)] p-8">
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">{t("cs.newTicket")}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none" placeholder="user@example.com" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-1">Type</label>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] outline-none">
            <option value="general">General inquiry</option>
            <option value="booking">Booking issue</option>
            <option value="payment">Payment issue</option>
            <option value="flight">Flight issue</option>
            <option value="complaint">Complaint</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-1">Priority</label>
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] outline-none">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-1">Summary</label>
          <textarea rows={4} value={form.summary} onChange={e => setForm({...form, summary: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none resize-none" placeholder="Brief description..." />
        </div>
        <button className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition">
          {t("cs.submit")}
        </button>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
        <div className="text-3xl font-bold text-[var(--color-primary)]">12</div>
        <div className="text-sm text-[var(--color-text-muted)] mt-1">{t("cs.openTickets")}</div>
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
        <div className="text-3xl font-bold text-[var(--color-success)]">48</div>
        <div className="text-sm text-[var(--color-text-muted)] mt-1">{t("cs.closedTickets")}</div>
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
        <div className="text-3xl font-bold text-[var(--color-text)]">60</div>
        <div className="text-sm text-[var(--color-text-muted)] mt-1">{t("cs.totalTickets")}</div>
      </div>
    </div>
  );
}

function StaffTab() {
  const { t } = useI18n();
  const staff = [
    { name: "Alice Mwamba", role: "Support Lead", email: "alice@congoconnect.cd", tickets: 18, status: "online" },
    { name: "Jean Kabila", role: "Agent", email: "jean@congoconnect.cd", tickets: 12, status: "online" },
    { name: "Fatima Nsekela", role: "Agent", email: "fatima@congoconnect.cd", tickets: 8, status: "away" },
    { name: "Pierre Tshilumba", role: "Supervisor", email: "pierre@congoconnect.cd", tickets: 5, status: "online" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">{t("cs.staff")}</h2>
      <div className="grid gap-4">
        {staff.map(s => (
          <div key={s.name} className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${s.status === "online" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {s.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[var(--color-text)]">{s.name}</div>
              <div className="text-sm text-[var(--color-text-muted)]">{s.role} · {s.email}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{s.tickets} {t("cs.activeTickets")}</div>
              <div className={`text-xs ${s.status === "online" ? "text-green-600" : "text-yellow-600"}`}>{s.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
