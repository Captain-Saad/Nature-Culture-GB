"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import type { AdminTripLead, AdminContactMessage, AdminDestination } from "@/lib/admin/types";

type Tab = "leads" | "messages";

const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
const MESSAGE_STATUSES = ["NEW", "READ"] as const;

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-orange-200 text-orange-900",
  CONTACTED: "bg-forest-100 text-forest-800",
  CLOSED: "bg-cream-300 text-forest-700",
  READ: "bg-forest-100 text-forest-800",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

/**
 * Trip leads and contact messages in one screen, since both are inbound
 * enquiries an admin works through the same way. Neither is authored here --
 * they arrive from the public forms -- so there's no create or delete, only
 * reading and moving a row through its status.
 */
export default function LeadsManager() {
  const { request } = useAdminApi();
  const [tab, setTab] = useState<Tab>("leads");

  const [leads, setLeads] = useState<AdminTripLead[] | null>(null);
  const [messages, setMessages] = useState<AdminContactMessage[] | null>(null);
  /** id -> name, so a lead shows "Skardu" rather than a raw cuid. */
  const [destinationNames, setDestinationNames] = useState<Record<string, string>>({});

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [leadRes, msgRes, destRes] = await Promise.all([
      request<AdminTripLead[]>("leads"),
      request<AdminContactMessage[]>("contact-messages"),
      request<AdminDestination[]>("destinations"),
    ]);

    if (leadRes.error || msgRes.error) {
      setError(leadRes.error ?? msgRes.error);
      return;
    }
    setLeads(leadRes.data ?? []);
    setMessages(msgRes.data ?? []);

    // A failed destination lookup is cosmetic -- fall back to raw ids.
    if (destRes.data) {
      setDestinationNames(Object.fromEntries(destRes.data.map((d) => [d.id, d.name])));
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateLeadStatus(lead: AdminTripLead, status: string) {
    setSavingId(lead.id);
    const { error: err } = await request(`leads/${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setSavingId(null);
    if (err) {
      setError(err);
      return;
    }
    setLeads((prev) =>
      prev?.map((l) => (l.id === lead.id ? { ...l, status: status as AdminTripLead["status"] } : l)) ?? null
    );
  }

  async function updateMessageStatus(message: AdminContactMessage, status: string) {
    setSavingId(message.id);
    const { error: err } = await request(`contact-messages/${message.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setSavingId(null);
    if (err) {
      setError(err);
      return;
    }
    setMessages((prev) =>
      prev?.map((m) =>
        m.id === message.id ? { ...m, status: status as AdminContactMessage["status"] } : m
      ) ?? null
    );
  }

  const statuses = tab === "leads" ? LEAD_STATUSES : MESSAGE_STATUSES;
  const rows = tab === "leads" ? leads : messages;
  const filtered = rows?.filter((r) => statusFilter === "ALL" || r.status === statusFilter) ?? null;

  const newLeads = leads?.filter((l) => l.status === "NEW").length ?? 0;
  const newMessages = messages?.filter((m) => m.status === "NEW").length ?? 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              ["leads", "Trip Leads", leads?.length ?? 0, newLeads],
              ["messages", "Contact Messages", messages?.length ?? 0, newMessages],
            ] as const
          ).map(([key, label, total, unread]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setStatusFilter("ALL");
                setExpanded(null);
              }}
              aria-pressed={tab === key}
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
                tab === key
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-cream-300 text-forest-700 hover:bg-forest-50"
              }`}
            >
              {label} ({total})
              {unread > 0 && (
                <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {unread} new
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-forest-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
          >
            <option value="ALL">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}{" "}
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </div>
      )}

      {rows === null && !error && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">Loading…</div>
      )}

      {filtered !== null && filtered.length === 0 && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
          {rows && rows.length > 0
            ? `No ${tab === "leads" ? "leads" : "messages"} with that status.`
            : `No ${tab === "leads" ? "trip leads" : "contact messages"} yet.`}
        </div>
      )}

      {filtered !== null && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((row) => {
            const isLead = tab === "leads";
            const lead = row as AdminTripLead;
            const message = row as AdminContactMessage;
            const isOpen = expanded === row.id;

            return (
              <div key={row.id} className="rounded-card bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-forest-900">{row.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          STATUS_STYLES[row.status] ?? "bg-cream-200 text-forest-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-forest-600">
                      {isLead ? lead.contact : message.email}
                      {!isLead && message.subject ? ` — ${message.subject}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-forest-500">{formatDate(row.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={row.status}
                      disabled={savingId === row.id}
                      onChange={(e) =>
                        isLead
                          ? updateLeadStatus(lead, e.target.value)
                          : updateMessageStatus(message, e.target.value)
                      }
                      aria-label={`Status for ${row.name}`}
                      className="rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500 disabled:opacity-60"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : row.id)}
                      aria-expanded={isOpen}
                      className="rounded-full border-2 border-forest-700 px-3 py-1.5 text-xs font-bold text-forest-700 hover:bg-forest-50"
                    >
                      {isOpen ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t border-cream-200 pt-4 text-sm text-forest-700">
                    {isLead ? (
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-semibold uppercase text-forest-500">Starting City</dt>
                          <dd>{lead.startingCity}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-forest-500">Trip Length</dt>
                          <dd>
                            {lead.days} day{lead.days === 1 ? "" : "s"}, {lead.travelers} traveller
                            {lead.travelers === 1 ? "" : "s"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-forest-500">Budget</dt>
                          <dd>{lead.budgetPKR ? `PKR ${lead.budgetPKR.toLocaleString()}` : "Not given"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-forest-500">Hotel / Transport</dt>
                          <dd>
                            {lead.hotelCategory ?? "Any"} / {lead.transport ?? "Any"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-semibold uppercase text-forest-500">Destinations</dt>
                          <dd>
                            {lead.destinationIds.length > 0
                              ? lead.destinationIds.map((id) => destinationNames[id] ?? id).join(", ")
                              : "None selected"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-semibold uppercase text-forest-500">Activities</dt>
                          <dd>{lead.activities.length > 0 ? lead.activities.join(", ") : "None selected"}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
