import { useRef, useEffect, ReactElement, cloneElement } from "react";
import gsap from "gsap";

export default function Magnetic({ children }: { children: ReactElement }) {
  const magnetic = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const xTo = gsap.quickTo(magnetic.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(magnetic.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = magnetic.current!.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.35);
      yTo(y * 0.35);
    };

    const mouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    const el = magnetic.current;
    if (el) {
      el.addEventListener("mousemove", mouseMove);
      el.addEventListener("mouseleave", mouseLeave);
    }

    return () => {
      if (el) {
        el.removeEventListener("mousemove", mouseMove);
        el.removeEventListener("mouseleave", mouseLeave);
      }
    };
  }, []);

  return cloneElement(children, { ref: magnetic });
}
