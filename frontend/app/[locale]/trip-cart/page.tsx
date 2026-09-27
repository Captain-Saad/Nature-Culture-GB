import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MyTripClient from "@/components/tripCart/MyTripClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: t("pageTitle"),
    description: "Review your trip cart and send us a request — no payment, just a quick way to reach us.",
  };
}

export default function TripCartPage() {
  return <MyTripClient />;
}
