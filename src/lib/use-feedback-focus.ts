"use client";

import { type RefObject, useEffect } from "react";

export function useFeedbackFocus<T extends HTMLElement>(ref: RefObject<T | null>, trigger: unknown) {
  useEffect(() => {
    if (!trigger) return;

    const element = ref.current;
    if (!element) return;

    const frame = window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [ref, trigger]);
}
