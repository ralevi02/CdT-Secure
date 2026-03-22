"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const prevPath = useRef(pathname);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      stop();
    }
  }, [pathname, stop]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || anchor.target === "_blank") return;
      if (href === pathname) return;

      setVisible(true);
      setProgress(15);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 8));
      }, 200);
    };

    document.addEventListener("click", handler, true);
    return () => {
      document.removeEventListener("click", handler, true);
      clearInterval(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
      <div
        className="h-full bg-primary transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          transitionDuration: progress >= 100 ? "300ms" : "200ms",
        }}
      />
    </div>
  );
}
