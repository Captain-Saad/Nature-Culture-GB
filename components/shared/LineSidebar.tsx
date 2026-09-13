"use client";

import { useEffect, useState } from "react";

export interface SidebarSection {
  id: string;
  label: string;
}

export default function LineSidebar({ sections }: { sections: SidebarSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-24 hidden w-48 shrink-0 self-start lg:block"
    >
      <ul className="relative border-l border-cream-300 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
        {sections.map((s) => (
          <li key={s.id} className="relative py-2">
            <span
              aria-hidden
              className={`absolute -left-[1.0625rem] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-colors rtl:-left-auto rtl:-right-[1.0625rem] ${
                activeId === s.id ? "bg-orange-500" : "bg-cream-300"
              }`}
            />
            <button
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`text-left text-sm font-semibold transition-colors rtl:text-right ${
                activeId === s.id ? "text-forest-900" : "text-forest-500 hover:text-forest-700"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
