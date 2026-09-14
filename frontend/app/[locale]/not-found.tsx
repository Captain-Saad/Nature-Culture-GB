import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-4xl font-bold text-forest-900">404</h1>
      <p className="mt-3 text-forest-600">We couldn&apos;t find that page.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
      >
        Back to Home
      </Link>
    </div>
  );
}
