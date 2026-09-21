import type { Metadata } from "next";
import MyTripClient from "@/components/tripCart/MyTripClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "My Trip",
    description: "Review your trip and send us a request — no payment, just a quick way to reach us.",
  };
}

export default function MyTripPage() {
  return <MyTripClient />;
}
