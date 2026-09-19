import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getWeather } from "@/lib/api";
import WeatherCard from "@/components/weather/WeatherCard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Weather",
    description: "Weather conditions across Gilgit-Baltistan's major towns.",
  };
}

export default async function WeatherPage() {
  const t = await getTranslations("weather");
  const weather = await getWeather();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {weather.map((w) => (
          <WeatherCard key={w.location} weather={w} />
        ))}
      </div>
    </div>
  );
}
