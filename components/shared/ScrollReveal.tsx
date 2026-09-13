"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
}

/**
 * Fades + slides direct children up into place as the container enters
 * the viewport. Uses selector-based targeting so it works whether the
 * caller passes one element or a list of cards.
 */
export default function ScrollReveal({ children, className = "", y = 30, stagger = 0.08 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.children.length ? Array.from(el.children) : [el];

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [y, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
