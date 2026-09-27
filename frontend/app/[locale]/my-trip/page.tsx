import { redirect } from "next/navigation";

/** The trip cart moved to /trip-cart; keeps old links and bookmarks working. */
export default async function MyTripRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/trip-cart`);
}
