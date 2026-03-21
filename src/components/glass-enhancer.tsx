"use client";

import { useEffect } from "react";
import { getDisplacementFilter } from "@/lib/displacement";

function detectSVGFilterSupport(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /chrome|chromium|crios|edg/.test(ua) && !/firefox|fxios/.test(ua);
}

type GlassConfig = {
  depth: number;
  blur: number;
  strength: number;
  ca: number;
  radius: number;
};

/**
 * Only the outer shell elements get the expensive SVG displacement filter.
 * Everything inside the scrollable area uses CSS-only glass (no jank).
 */
const SVG_VARIANTS: Record<string, GlassConfig> = {
  panel: { depth: 8, blur: 1.5, strength: 50, ca: 1.5, radius: 22 },
};

const cache = new Map<string, string>();

function applyFilter(el: HTMLElement) {
  const variant = el.getAttribute("data-glass");
  if (!variant) return;

  const cfg = SVG_VARIANTS[variant];
  if (!cfg) return;

  const rect = el.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);
  if (w < 50 || h < 50) return;

  const key = `${variant}-${w}-${h}`;
  let filterUrl = cache.get(key);
  if (!filterUrl) {
    filterUrl = getDisplacementFilter({
      height: h,
      width: w,
      radius: cfg.radius,
      depth: cfg.depth,
      strength: cfg.strength,
      chromaticAberration: cfg.ca,
    });
    cache.set(key, filterUrl);
  }

  const { blur } = cfg;
  const value = `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.1) saturate(1.5)`;
  el.style.setProperty("backdrop-filter", value, "important");
  el.style.setProperty("-webkit-backdrop-filter", value, "important");
}

/**
 * Applies the real SVG displacement filter only to outer shell panels
 * (sidebar + main). Inner elements keep the lightweight CSS-only glass
 * so scrolling stays smooth.
 */
export function GlassEnhancer() {
  useEffect(() => {
    if (!detectSVGFilterSupport()) return;

    function enhance() {
      document.querySelectorAll<HTMLElement>('[data-glass="panel"]').forEach(applyFilter);
    }

    requestAnimationFrame(() => requestAnimationFrame(enhance));

    const mo = new MutationObserver(() => {
      requestAnimationFrame(enhance);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      cache.clear();
      resizeTimer = setTimeout(() => requestAnimationFrame(enhance), 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return null;
}
