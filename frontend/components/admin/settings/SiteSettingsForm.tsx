"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import SingleMediaPicker from "@/components/admin/shared/SingleMediaPicker";
import TagListInput from "@/components/admin/shared/TagListInput";
import ExploreSectionEditor from "@/components/admin/settings/ExploreSectionEditor";
import CardsEditor from "@/components/admin/settings/CardsEditor";
import { normalizeExploreTiles, type ExploreTile } from "@/lib/exploreTiles";
import { cardList, getBusinessContact, highlightList, type ContentCard } from "@/lib/siteContent";
import type { AdminSiteSettings } from "@/lib/admin/types";

const HERO_VIDEO_MAX_BYTES = 30 * 1024 * 1024;

const INPUT =
  "mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500";

/** Plain text fields: "" means "not set" and falls back to the built-in (translated) default. */
const TEXT_FIELDS = [
  "heroHeadline",
  "heroSubtext",
  "heroBackgroundImage",
  "heroBackgroundVideo",
  "exploreTitle",
  "exploreSubtitle",
  "aboutUsCopy",
  "aboutMission",
  "contactDisplayText",
  "whyUsTitle",
  "whyUsSubtitle",
  "highlightsTitle",
  "finalCtaTitle",
  "finalCtaSubtitle",
  "finalCtaButton",
  "footerBlurb",
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

const SECTIONS = [
  ["hero", "Hero"],
  ["explore", "Explore Section"],
  ["home-copy", "Home Page Copy"],
  ["contact", "Contact Details"],
  ["about", "About Page"],
  ["footer", "Footer"],
] as const;

interface SiteSettingsFormProps {
  initial: AdminSiteSettings;
}

function Card({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-card bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-bold text-forest-900">{title}</h2>
      {hint && <p className="mt-1 text-xs text-forest-500">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows = 3,
  maxLength,
  type = "text",
  required,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  type?: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-forest-800">{label}</label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          maxLength={maxLength}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={INPUT}
        />
      ) : (
        <input
          type={type}
          value={value}
          maxLength={maxLength}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={INPUT}
        />
      )}
      {help && <p className="mt-1 text-xs text-forest-500">{help}</p>}
    </div>
  );
}

/**
 * The site-settings singleton: no list, no create, no delete -- just this
 * one form, PATCHing the single row. Trip-planner rates live on their own
 * page (/admin/pricing) but PATCH the same row.
 */
export default function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const { request } = useAdminApi();

  const [text, setText] = useState<Record<TextField, string>>(
    () => Object.fromEntries(TEXT_FIELDS.map((f) => [f, initial[f] ?? ""])) as Record<TextField, string>
  );
  const [exploreTiles, setExploreTiles] = useState<ExploreTile[]>(() => normalizeExploreTiles(initial.exploreTiles));

  // Contact details are shown pre-filled with what the site currently displays.
  const currentContact = getBusinessContact(initial);
  const [contactEmail, setContactEmail] = useState(currentContact.email);
  const [contactPhones, setContactPhones] = useState<string[]>(currentContact.phones);
  const [whatsappNumber, setWhatsappNumber] = useState(currentContact.whatsappNumber);
  const [instagramHandle, setInstagramHandle] = useState(currentContact.instagramHandle);

  const [aboutValues, setAboutValues] = useState<ContentCard[] | null>(() => cardList(initial.aboutValues));
  const [whyUsPoints, setWhyUsPoints] = useState<ContentCard[] | null>(() => cardList(initial.whyUsPoints));
  const [highlights, setHighlights] = useState<string[]>(() => highlightList(initial.highlights));

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function setField(key: TextField, value: string) {
    setText((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  /** Wraps a state setter so any edit clears the "Saved" banner. */
  function edit<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setSaved(false);
    };
  }

  const defaultAboutValues: ContentCard[] = [1, 2, 3].map((n) => ({
    title: t(`about.value${n}Title`),
    body: t(`about.value${n}Body`),
  }));
  const defaultWhyUsPoints: ContentCard[] = [1, 2, 3, 4].map((n) => ({
    title: t(`home.why.point${n}Title`),
    body: t(`home.why.point${n}Body`),
  }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const incompleteCards = [...(aboutValues ?? []), ...(whyUsPoints ?? [])].some((c) => !c.title.trim());
    if (incompleteCards) {
      setError("Every card needs a title — fill it in or remove the card.");
      return;
    }

    setSaving(true);
    const { error: err } = await request("site-settings", {
      method: "PATCH",
      body: JSON.stringify({
        ...text,
        exploreTiles,
        contactEmail,
        contactPhones,
        whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        instagramHandle: instagramHandle.replace(/^@/, ""),
        aboutValues,
        whyUsPoints,
        highlights,
      }),
    });
    setSaving(false);

    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaved(true);
    // Refreshes server-rendered pages so the change shows immediately.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <nav aria-label="Settings sections" className="flex flex-wrap gap-2">
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-forest-700 shadow-card hover:bg-forest-50"
          >
            {label}
          </a>
        ))}
      </nav>

      {error && (
        <p role="alert" className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-forest-100 px-4 py-3 text-sm font-semibold text-forest-800">
          Saved. The site will show the change on its next load.
        </p>
      )}

      <p className="text-xs text-forest-500">
        Text fields left empty use the site&apos;s built-in wording, which is translated on the Urdu site.
        Anything you type here is shown as-is in both languages.
      </p>

      <Card id="hero" title="Home Hero">
        <TextInput
          label="Headline"
          value={text.heroHeadline}
          onChange={(v) => setField("heroHeadline", v)}
          placeholder={`${t("home.hero.title")} ${t("home.hero.titleLine2")}`}
          maxLength={300}
        />
        <TextInput
          label="Subtext"
          value={text.heroSubtext}
          onChange={(v) => setField("heroSubtext", v)}
          placeholder={t("home.hero.subtitle")}
          multiline
        />
        <p className="text-xs text-forest-500">
          If a video is set it plays behind the hero on every screen size, with the image as its poster
          (shown while it loads, and instead of the video for visitors who turn on reduced motion or data
          saving). Keep uploads short and light — phones download the whole file.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <SingleMediaPicker
            label="Background Image"
            kind="image"
            value={text.heroBackgroundImage}
            onChange={(url) => setField("heroBackgroundImage", url)}
            helpText="Used on its own, and as the video's poster frame. JPG, PNG or WebP up to 5MB."
          />
          <SingleMediaPicker
            label="Background Video"
            kind="video"
            value={text.heroBackgroundVideo}
            onChange={(url) => setField("heroBackgroundVideo", url)}
            maxBytes={HERO_VIDEO_MAX_BYTES}
            helpText="Optional. Muted, looping MP4 up to 30MB — keep it short."
          />
        </div>
      </Card>

      <div id="explore" className="scroll-mt-24">
        <ExploreSectionEditor
          title={text.exploreTitle}
          subtitle={text.exploreSubtitle}
          tiles={exploreTiles}
          onTitleChange={(v) => setField("exploreTitle", v)}
          onSubtitleChange={(v) => setField("exploreSubtitle", v)}
          onTilesChange={edit(setExploreTiles)}
        />
      </div>

      <Card id="home-copy" title="Home Page Copy" hint="The sections below the listings on the home page.">
        <h3 className="text-sm font-bold uppercase tracking-wide text-forest-600">Why Choose Us</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Title"
            value={text.whyUsTitle}
            onChange={(v) => setField("whyUsTitle", v)}
            placeholder={t("home.why.title")}
            maxLength={200}
          />
          <TextInput
            label="Subtitle"
            value={text.whyUsSubtitle}
            onChange={(v) => setField("whyUsSubtitle", v)}
            placeholder={t("home.why.subtitle")}
          />
        </div>
        <CardsEditor
          label="Points"
          cards={whyUsPoints}
          defaults={defaultWhyUsPoints}
          onChange={edit(setWhyUsPoints)}
        />

        <h3 className="border-t border-cream-200 pt-4 text-sm font-bold uppercase tracking-wide text-forest-600">
          Highlights Strip
        </h3>
        <TextInput
          label="Heading"
          value={text.highlightsTitle}
          onChange={(v) => setField("highlightsTitle", v)}
          placeholder={t("home.partners.title")}
          maxLength={200}
        />
        <TagListInput
          label="Labels (scroll across the page, in this order)"
          values={highlights}
          onChange={edit(setHighlights)}
          placeholder="e.g. Baltit Fort"
        />

        <h3 className="border-t border-cream-200 pt-4 text-sm font-bold uppercase tracking-wide text-forest-600">
          Closing Call to Action
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Title"
            value={text.finalCtaTitle}
            onChange={(v) => setField("finalCtaTitle", v)}
            placeholder={t("home.finalCta.title")}
            maxLength={200}
          />
          <TextInput
            label="Button Label"
            value={text.finalCtaButton}
            onChange={(v) => setField("finalCtaButton", v)}
            placeholder={t("home.finalCta.cta")}
            maxLength={40}
            help="The button always opens Plan My Trip."
          />
        </div>
        <TextInput
          label="Subtitle"
          value={text.finalCtaSubtitle}
          onChange={(v) => setField("finalCtaSubtitle", v)}
          placeholder={t("home.finalCta.subtitle")}
        />
      </Card>

      <Card
        id="contact"
        title="Contact Details"
        hint="Shown in the footer, on the About and Contact pages, in the Book Now dialog and after checkout."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Email"
            type="email"
            required
            value={contactEmail}
            onChange={edit(setContactEmail)}
            maxLength={320}
          />
          <TextInput
            label="Instagram Handle"
            required
            value={instagramHandle}
            onChange={edit(setInstagramHandle)}
            maxLength={31}
            help="Handle only, e.g. natureandculturegb"
          />
          <TextInput
            label="WhatsApp Number"
            required
            value={whatsappNumber}
            onChange={edit(setWhatsappNumber)}
            maxLength={20}
            help="International format, digits only — e.g. 923008153848 for 0300 8153848."
          />
        </div>
        <TagListInput
          label="Phone Numbers (the first one is dialled by the Call buttons)"
          values={contactPhones}
          onChange={edit(setContactPhones)}
          placeholder="e.g. 0300 8153848"
        />
        <TextInput
          label="Additional Contact Text"
          value={text.contactDisplayText}
          onChange={(v) => setField("contactDisplayText", v)}
          placeholder="e.g. office hours or address — shown under the contact details."
          multiline
        />
      </Card>

      <Card id="about" title="About Page">
        <TextInput
          label="Our Story"
          value={text.aboutUsCopy}
          onChange={(v) => setField("aboutUsCopy", v)}
          placeholder={t("about.story")}
          multiline
          rows={6}
        />
        <TextInput
          label="Our Mission"
          value={text.aboutMission}
          onChange={(v) => setField("aboutMission", v)}
          placeholder={t("about.mission")}
          multiline
          rows={4}
        />
        <CardsEditor
          label="Value Cards"
          cards={aboutValues}
          defaults={defaultAboutValues}
          onChange={edit(setAboutValues)}
          max={6}
        />
      </Card>

      <Card id="footer" title="Footer">
        <TextInput
          label="Footer Blurb"
          value={text.footerBlurb}
          onChange={(v) => setField("footerBlurb", v)}
          placeholder={t("footer.blurb")}
          multiline
        />
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card-lg transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
