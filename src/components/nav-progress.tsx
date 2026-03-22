"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setLoading(false);
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  useEffect(() => {
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    function onStart() {
      setLoading(true);
      setProgress(20);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 10));
      }, 300);
    }

    history.pushState = function (...args) {
      onStart();
      return origPush(...args);
    };

    history.replaceState = function (...args) {
      onStart();
      return origReplace(...args);
    };

    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) clearInterval(timerRef.current);
  }, [loading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}
