"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor: a small dot + a trailing ring.
 * Grows over links/buttons. Add data-cursor="View" to any element to show a label.
 * Hidden on touch screens and in record mode.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");
    return () => document.documentElement.classList.remove("has-custom-cursor");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08 });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3.out" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest("[data-cursor]") as HTMLElement | null;
      const interactive = t.closest("a, button, [data-magnetic]");
      setLabel(labelled?.dataset.cursor || "");
      gsap.to(ring.current, {
        scale: labelled ? 2.8 : interactive ? 1.7 : 1,
        backgroundColor: labelled ? "var(--accent)" : "rgba(0,0,0,0)",
        borderWidth: labelled ? 0 : 1,
        duration: 0.4,
        ease: "back.out(1.5)",
      });
      gsap.to(dot.current, {
        opacity: (labelled || !shown) ? 0 : 1,
        scale: interactive && !labelled ? 0.5 : 1,
        duration: 0.3
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cursor-layer pointer-events-none fixed inset-0 z-[90] [html.is-recording_&]:hidden" aria-hidden>
      <div ref={ring} className="absolute -left-[18px] -top-[18px] flex h-9 w-9 opacity-0 items-center justify-center rounded-full border border-accent overflow-hidden shadow-sm">
        <span 
          className={`text-[5px] uppercase tracking-[0.2em] font-bold text-accent-fg transition-all duration-300 flex items-center justify-center ${label ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        >
          {label === "Add" ? <span className="text-[12px] pb-[1px] leading-none">+</span> : label}
        </span>
      </div>
      <div ref={dot} className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-accent opacity-0" />
    </div>
  );
}
