import { useLocale, useTranslations } from "next-intl";
import { WeatherEntry } from "@/lib/types";
import { weatherIconEmoji } from "@/lib/utils/weatherIcon";

/** "en" -> "en-US", "ur" -> "ur-PK" -- what Intl.DateTimeFormat expects. */
const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  ur: "ur-PK",
};

function conditionLabel(t: ReturnType<typeof useTranslations<"weather">>, key: string | null) {
  if (!key) return null;
  return t.has(`conditions.${key}`) ? t(`conditions.${key}`) : t("conditions.unknown");
}

export default function WeatherCard({ weather }: { weather: WeatherEntry }) {
  const t = useTranslations("common");
  const tw = useTranslations("weather");
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const available = weather.available;

  return (
    <article className="flex flex-col rounded-card bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-forest-900">{weather.label}</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            available ? "bg-forest-100 text-forest-800" : "bg-cream-300 text-forest-700"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${available ? "bg-forest-600" : "bg-forest-400"}`}
          />
          {available ? t("live") : t("dataUnavailable")}
        </span>
      </div>

      {available ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span aria-hidden className="text-4xl leading-none">
              {weatherIconEmoji(weather.icon)}
            </span>
            <span className="font-display text-4xl font-bold text-forest-900">{weather.tempC}°C</span>
            <span className="text-sm text-forest-600">{conditionLabel(tw, weather.condition)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-500">
            {weather.humidity !== null && (
              <span>
                {tw("humidity")}: {weather.humidity}%
              </span>
            )}
            {weather.windKph !== null && (
              <span>
                {tw("wind")}: {weather.windKph} km/h
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-cream-400 bg-cream-50 p-4 text-center text-sm text-forest-500">
          <p>{t("dataUnavailable")}</p>
          <p className="mt-1 text-xs">Live weather data will appear here once connected.</p>
        </div>
      )}

      {weather.forecast.length > 0 && (
        <div className="mt-5 grid grid-cols-4 gap-2 border-t border-cream-200 pt-4 text-center sm:grid-cols-7">
          {weather.forecast.map((f) => (
            <div key={f.date} className="text-xs text-forest-600">
              <p className="font-semibold">{dateFormatter.format(new Date(`${f.date}T00:00:00`))}</p>
              <p aria-hidden className="mt-1 text-base leading-none">
                {weatherIconEmoji(f.icon)}
              </p>
              <p className="mt-1">
                {f.tempHighC !== null ? `${f.tempHighC}°` : "–"}
                {" / "}
                {f.tempLowC !== null ? `${f.tempLowC}°` : "–"}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
