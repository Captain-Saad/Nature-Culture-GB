import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

interface SectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  tone?: "light" | "dark";
}

export default function Section({
  id,
  title,
  subtitle,
  children,
  className = "",
  seeAllHref,
  seeAllLabel,
  tone = "light",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-16 sm:py-20 ${tone === "dark" ? "bg-navy-800 text-cream-50" : ""} ${className}`}
    >
      <div className="container-content">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
            {subtitle && (
              <p className={`mt-2 max-w-xl text-sm sm:text-base ${tone === "dark" ? "text-cream-200" : "text-forest-600"}`}>
                {subtitle}
              </p>
            )}
          </div>
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className={`text-sm font-bold ${tone === "dark" ? "text-orange-300" : "text-orange-600"} hover:underline`}
            >
              {seeAllLabel} →
            </Link>
          )}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
