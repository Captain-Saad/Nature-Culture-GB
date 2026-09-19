import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Hero from "@/components/home/Hero";
import ExploreRegions from "@/components/home/ExploreRegions";
import LogoLoop from "@/components/home/LogoLoop";
import WhyUs from "@/components/home/WhyUs";
import FinalCta from "@/components/home/FinalCta";
import Section from "@/components/shared/Section";
import ScrollReveal from "@/components/shared/ScrollReveal";
import DestinationCard from "@/components/destinations/DestinationCard";
import MountainCard from "@/components/mountains/MountainCard";
import HotelCard from "@/components/hotels/HotelCard";
import PackageCard from "@/components/packages/PackageCard";
import WeatherCard from "@/components/weather/WeatherCard";
import FlightCard from "@/components/flights/FlightCard";
import SituationReportCard from "@/components/situation/SituationReportCard";
import ReviewsCarousel from "@/components/reviews/ReviewsCarousel";
import { Link } from "@/i18n/navigation";
import {
  getDestinations,
  getMountains,
  getHotels,
  getPackages,
  getWeather,
  getFlights,
  getSituationReports,
  getReviews,
} from "@/lib/api";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nature & Culture GB — Discover the Nature, Experience the Culture",
    description:
      "Plan your journey through Gilgit-Baltistan: destinations, hotels, mountains, tour packages, weather, flights and travel updates — all in one place.",
    openGraph: { title: "Nature & Culture GB", type: "website" },
  };
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const [
    destinations,
    mountains,
    hotels,
    packages,
    weather,
    flights,
    situationReports,
    reviews,
    siteSettings,
  ] = await Promise.all([
    getDestinations(),
    getMountains(),
    getHotels(),
    getPackages(),
    getWeather(),
    getFlights(),
    getSituationReports(),
    getReviews(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero
        headline={siteSettings?.heroHeadline}
        subtext={siteSettings?.heroSubtext}
        backgroundImage={siteSettings?.heroBackgroundImage}
        backgroundVideo={siteSettings?.heroBackgroundVideo}
      />

      <Section
        id="explore"
        title={t("exploreSection.title")}
        subtitle={t("exploreSection.subtitle")}
      >
        <ExploreRegions />
      </Section>

      <Section
        title={t("destinations.title")}
        subtitle={t("destinations.subtitle")}
        seeAllHref="/destinations"
        seeAllLabel={t("destinations.title")}
        className="bg-cream-100"
      >
        <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.slice(0, 4).map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </ScrollReveal>
      </Section>

      <Section
        title={t("mountains.title")}
        subtitle={t("mountains.subtitle")}
        seeAllHref="/mountains"
        seeAllLabel={t("mountains.title")}
      >
        <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mountains.slice(0, 3).map((m) => (
            <MountainCard key={m.id} mountain={m} />
          ))}
        </ScrollReveal>
      </Section>

      <Section
        title={t("hotels.title")}
        subtitle={t("hotels.subtitle")}
        seeAllHref="/hotels"
        seeAllLabel={t("hotels.title")}
        className="bg-cream-100"
      >
        <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.slice(0, 3).map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </ScrollReveal>
      </Section>

      <Section
        title={t("packages.title")}
        subtitle={t("packages.subtitle")}
        seeAllHref="/packages"
        seeAllLabel={t("packages.title")}
      >
        <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.slice(0, 3).map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </ScrollReveal>
      </Section>

      <section className="bg-navy-gradient py-16 text-cream-50 sm:py-20">
        <div className="container-content text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("tripBuilder.title")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-cream-200">{t("tripBuilder.subtitle")}</p>
          <Link
            href="/plan-my-trip"
            className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
          >
            {t("tripBuilder.cta")}
          </Link>
        </div>
      </section>

      <Section
        title={t("weather.title")}
        subtitle={t("weather.subtitle")}
        seeAllHref="/weather"
        seeAllLabel={t("weather.title")}
        className="bg-cream-100"
      >
        <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {weather.slice(0, 3).map((w) => (
            <WeatherCard key={w.location} weather={w} />
          ))}
        </ScrollReveal>
      </Section>

      <Section
        title={t("flights.title")}
        subtitle={t("flights.subtitle")}
        seeAllHref="/flights"
        seeAllLabel={t("flights.title")}
      >
        <ScrollReveal className="grid gap-4">
          {flights.slice(0, 2).map((f) => (
            <FlightCard key={f.id} flight={f} />
          ))}
        </ScrollReveal>
      </Section>

      <Section
        title={t("travelUpdates.title")}
        subtitle={t("travelUpdates.subtitle")}
        seeAllHref="/travel-updates"
        seeAllLabel={t("travelUpdates.title")}
        className="bg-cream-100"
      >
        <ScrollReveal className="grid gap-4 sm:grid-cols-2">
          {situationReports.slice(0, 4).map((r) => (
            <SituationReportCard key={r.id} report={r} />
          ))}
        </ScrollReveal>
      </Section>

      <WhyUs />

      <Section
        title={t("reviews.title")}
        subtitle={t("reviews.subtitle")}
        seeAllHref="/reviews"
        seeAllLabel={t("reviews.title")}
        className="bg-cream-100"
      >
        <ReviewsCarousel reviews={reviews} />
      </Section>

      <div>
        <p className="container-content pt-10 text-center text-xs font-semibold uppercase tracking-wide text-forest-500">
          {t("partners.title")}
        </p>
        <LogoLoop />
      </div>

      <FinalCta />
    </>
  );
}
