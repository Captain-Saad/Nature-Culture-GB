import type { TripLead } from "@prisma/client";
import type { TripLeadInput } from "../validators/tripLead";

type CartItem = TripLeadInput["cartItems"][number];
type TripPlanItem = Extract<CartItem, { type: "tripPlan" }>;

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString("en-US")}`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Pakistan time, e.g. "27 Sep 2026, 3:19 PM" -- how dates read in the email and the sheet. */
export function formatPkt(date: Date): string {
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** cartItems as stored (Json) -- written only by the validated POST /trip-leads, so the shape holds. */
export function leadCartItems(lead: Pick<TripLead, "cartItems">): CartItem[] {
  return Array.isArray(lead.cartItems) ? (lead.cartItems as unknown as CartItem[]) : [];
}

function planSummary(plan: TripPlanItem): string {
  return [
    plan.destinations.map((d) => d.name).join(", "),
    `from ${plan.startingCity}`,
    plural(plan.days, "day"),
    plural(plan.travelers, "traveller"),
    `${plan.hotelCategory} hotels / ${plan.transport}`,
    plan.activities.length ? plan.activities.join(", ") : null,
    `budget ${pkr(plan.budgetPKR)}`,
    `est. ${pkr(plan.estimate.total)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Leads sent straight from the wizard before it was folded into the cart
 * have the itinerary in top-level columns instead of a tripPlan item.
 */
function legacyPlanSummary(lead: TripLead): string | null {
  if (!lead.startingCity && lead.days === null && lead.destinationIds.length === 0) return null;
  return [
    lead.destinationIds.length ? `destinations: ${lead.destinationIds.join(", ")}` : null,
    lead.startingCity ? `from ${lead.startingCity}` : null,
    lead.days !== null ? plural(lead.days, "day") : null,
    lead.hotelCategory || lead.transport ? `${lead.hotelCategory ?? "any"} hotels / ${lead.transport ?? "any"}` : null,
    lead.activities.length ? lead.activities.join(", ") : null,
    lead.budgetPKR !== null ? `budget ${pkr(lead.budgetPKR)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function itemLine(item: Exclude<CartItem, TripPlanItem>): string {
  switch (item.type) {
    case "destination":
      return `Destination: ${item.name} (${item.region})${
        item.estimatedPricePKR ? ` — ${pkr(item.estimatedPricePKR.min)}–${pkr(item.estimatedPricePKR.max).replace("PKR ", "")}` : ""
      }`;
    case "package":
      return `Package: ${item.name} (${plural(item.durationDays, "day")})${
        item.estimatedPricePKR ? ` — ${pkr(item.estimatedPricePKR.min)}–${pkr(item.estimatedPricePKR.max).replace("PKR ", "")}` : ""
      }`;
    case "hotelRoom":
      return `Hotel room: ${item.hotelName} — ${item.roomType} (check-in ${item.checkIn}, ${plural(item.nights, "night")}, ${plural(item.guests, "guest")})${
        item.estimatedPricePKR ? ` — ${pkr(item.estimatedPricePKR * item.nights)}` : ""
      }`;
  }
}

/** Same arithmetic as the Trip Cart's estimated total (frontend lib/tripCart/estimateTotal.ts). */
export function leadEstimate(lead: TripLead): { min: number; max: number } | null {
  let min = 0;
  let max = 0;
  let any = false;
  for (const item of leadCartItems(lead)) {
    if (item.type === "tripPlan") {
      min += item.estimate.total;
      max += item.estimate.total;
      any = true;
    } else if (item.type === "hotelRoom") {
      if (item.estimatedPricePKR) {
        min += item.estimatedPricePKR * item.nights;
        max += item.estimatedPricePKR * item.nights;
        any = true;
      }
    } else if (item.estimatedPricePKR) {
      min += item.estimatedPricePKR.min;
      max += item.estimatedPricePKR.max;
      any = true;
    }
  }
  return any ? { min, max } : null;
}

function estimateText(lead: TripLead): string {
  const est = leadEstimate(lead);
  if (!est) return "";
  return est.min === est.max ? pkr(est.min) : `${pkr(est.min)}–${pkr(est.max).replace("PKR ", "")}`;
}

/** Everything about a lead, as the ordered sections shared by the plain-text and HTML emails. */
function leadSections(lead: TripLead) {
  const items = leadCartItems(lead);
  const plan = items.find((i): i is TripPlanItem => i.type === "tripPlan");
  const others = items.filter((i): i is Exclude<CartItem, TripPlanItem> => i.type !== "tripPlan");

  const contact: [string, string][] = [
    ["Name", lead.name],
    ["Phone / WhatsApp", lead.contact],
    ...(lead.email ? ([["Email", lead.email]] as [string, string][]) : []),
    ...(lead.travelers !== null ? ([["Travellers", String(lead.travelers)]] as [string, string][]) : []),
    ...(lead.preferredDates ? ([["Preferred dates", lead.preferredDates]] as [string, string][]) : []),
    ["Submitted", formatPkt(lead.createdAt)],
    ["Status", lead.status],
    ["Lead ID", lead.id],
  ];

  const planRows: [string, string][] | null = plan
    ? [
        ["Destinations", plan.destinations.map((d) => (d.region ? `${d.name} (${d.region})` : d.name)).join(", ")],
        ["Starting city", plan.startingCity],
        ["Length", `${plural(plan.days, "day")}, ${plural(plan.travelers, "traveller")}`],
        ["Hotels / transport", `${plan.hotelCategory} / ${plan.transport}`],
        ["Activities", plan.activities.length ? plan.activities.join(", ") : "None"],
        ["Budget", pkr(plan.budgetPKR)],
        [
          "Estimate shown",
          `${pkr(plan.estimate.total)} (hotel ${pkr(plan.estimate.hotel)}, transport ${pkr(plan.estimate.transport)}, food ${pkr(plan.estimate.food)}, activities ${pkr(plan.estimate.activities)}, entry fees ${pkr(plan.estimate.entryFees)}; rates as of ${plan.estimate.pricingAsOf})`,
        ],
      ]
    : null;

  return {
    contact,
    planRows,
    legacyPlan: legacyPlanSummary(lead),
    itemLines: others.map(itemLine),
    estimate: estimateText(lead),
    notes: lead.notes,
  };
}

export function leadDetailsText(lead: TripLead): string {
  const s = leadSections(lead);
  const lines: string[] = [];
  for (const [k, v] of s.contact) lines.push(`${k}: ${v}`);
  if (s.planRows) {
    lines.push("", "CUSTOM TRIP PLAN (Plan My Trip)");
    for (const [k, v] of s.planRows) lines.push(`  ${k}: ${v}`);
  }
  if (s.legacyPlan) lines.push("", `PLAN MY TRIP (older lead): ${s.legacyPlan}`);
  if (s.itemLines.length) {
    lines.push("", "TRIP CART");
    for (const line of s.itemLines) lines.push(`  - ${line}`);
  }
  if (s.estimate) lines.push("", `Estimated total: ${s.estimate}`);
  if (s.notes) lines.push("", "Notes:", s.notes);
  return lines.join("\n");
}

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function htmlTable(rows: [string, string][]): string {
  return `<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#4c8f65;font-weight:600;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="color:#0f291c">${esc(v)}</td></tr>`
    )
    .join("")}</table>`;
}

export function leadDetailsHtml(lead: TripLead, heading: string): string {
  const s = leadSections(lead);
  const h2 = (t: string) => `<h3 style="margin:20px 0 6px;color:#1b4530;font-size:15px">${esc(t)}</h3>`;
  return [
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;color:#0f291c">`,
    `<h2 style="color:#1b4530;margin:0 0 12px">${esc(heading)}</h2>`,
    htmlTable(s.contact),
    s.planRows ? h2("Custom trip plan (Plan My Trip)") + htmlTable(s.planRows) : "",
    s.legacyPlan ? h2("Plan My Trip (older lead)") + `<p style="font-size:14px">${esc(s.legacyPlan)}</p>` : "",
    s.itemLines.length
      ? h2("Trip cart") + `<ul style="font-size:14px;padding-left:18px">${s.itemLines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`
      : "",
    s.estimate ? `<p style="font-size:15px;margin-top:16px"><b>Estimated total:</b> ${esc(s.estimate)}</p>` : "",
    s.notes ? h2("Notes") + `<p style="font-size:14px;white-space:pre-wrap">${esc(s.notes)}</p>` : "",
    `</div>`,
  ].join("");
}

/** A short "what they booked" line for email subjects and the sheet. */
export function leadHeadline(lead: TripLead): string {
  const items = leadCartItems(lead);
  const plan = items.find((i): i is TripPlanItem => i.type === "tripPlan");
  if (plan) return plan.destinations.map((d) => d.name).join(", ");
  const names = items.map((i) => (i.type === "hotelRoom" ? i.hotelName : i.type === "tripPlan" ? "" : i.name));
  return names.filter(Boolean).slice(0, 3).join(", ") || "trip request";
}

/**
 * The lead as one Google Sheet row. SHEET_HEADERS is the column order; the
 * Apps Script matches rows on the "Lead ID" column, so re-sending a lead
 * (e.g. after a status change) updates its row instead of adding another.
 */
export const SHEET_HEADERS = [
  "Lead ID",
  "Submitted (PKT)",
  "Status",
  "Name",
  "Phone / WhatsApp",
  "Email",
  "Travellers",
  "Preferred Dates",
  "Custom Trip Plan",
  "Other Cart Items",
  "Estimated Total",
  "Notes",
  "Last Updated (PKT)",
] as const;

export function leadSheetRow(lead: TripLead): (string | number)[] {
  const items = leadCartItems(lead);
  const plan = items.find((i): i is TripPlanItem => i.type === "tripPlan");
  const others = items.filter((i): i is Exclude<CartItem, TripPlanItem> => i.type !== "tripPlan");
  return [
    lead.id,
    formatPkt(lead.createdAt),
    lead.status,
    lead.name,
    lead.contact,
    lead.email ?? "",
    lead.travelers ?? "",
    lead.preferredDates ?? "",
    plan ? planSummary(plan) : legacyPlanSummary(lead) ?? "",
    others.map(itemLine).join("\n"),
    estimateText(lead),
    lead.notes ?? "",
    formatPkt(new Date()),
  ];
}
