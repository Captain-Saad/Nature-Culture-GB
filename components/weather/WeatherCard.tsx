import { useTranslations } from "next-intl";
import { WeatherEntry } from "@/lib/types";

export default function WeatherCard({ weather }: { weather: WeatherEntry }) {
  const t = useTranslations("common");
  const isLive = weather.isLive;

  return (
    <article className="flex flex-col rounded-card bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-forest-900">{weather.city}</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isLive ? "bg-forest-100 text-forest-800" : "bg-cream-300 text-forest-700"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-forest-600" : "bg-forest-400"}`}
          />
          {isLive ? t("live") : t("dataUnavailable")}
        </span>
      </div>

      {isLive ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="font-display text-4xl font-bold text-forest-900">{weather.tempC}°C</span>
          <span className="text-sm text-forest-600">{weather.condition}</span>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-cream-400 bg-cream-50 p-4 text-center text-sm text-forest-500">
          <p>{t("dataUnavailable")}</p>
          <p className="mt-1 text-xs">Live weather data will appear here once connected.</p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-5 gap-1 border-t border-cream-200 pt-4 text-center">
        {weather.forecast.map((f) => (
          <div key={f.day} className="text-xs text-forest-600">
            <p className="font-semibold">{f.day}</p>
            <p className="mt-1">
              {f.tempHighC !== null ? `${f.tempHighC}°` : "–"}
              {" / "}
              {f.tempLowC !== null ? `${f.tempLowC}°` : "–"}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
