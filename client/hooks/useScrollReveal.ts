"use client";

import { useEffect } from "react";

/**
 * Observes all elements with .reveal, .reveal-left, .reveal-right,
 * .reveal-scale, or .reveal-grid and adds .visible when they enter
 * the viewport.
 */
export function useScrollReveal() {
  useEffect(() => {
    const selectors = ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-grid";
    const elements = document.querySelectorAll<HTMLElement>(selectors);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
