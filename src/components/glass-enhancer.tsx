"use client";

import { useEffect } from "react";
import { getDisplacementFilter } from "@/lib/displacement";

/**
 * Detects if the browser supports SVG filters inside backdrop-filter.
 * Only Chromium-based browsers support this (Chrome, Edge, Opera, etc.).
 * Firefox and Safari fall back to the CSS-only glass styles.
 */
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

const CONFIG: Record<string, GlassConfig> = {
  panel:          { depth: 8,  blur: 1.5, strength: 50, ca: 1.5, radius: 22 },
  card:           { depth: 6,  blur: 1.2, strength: 40, ca: 1,   radius: 20 },
  item:           { depth: 4,  blur: 1,   strength: 30, ca: 0.5, radius: 14 },
  "item-dim":     { depth: 3,  blur: 0.8, strength: 25, ca: 0,   radius: 14 },
  widget:         { depth: 5,  blur: 1.2, strength: 35, ca: 1,   radius: 18 },
  activity:       { depth: 5,  blur: 1,   strength: 35, ca: 0.5, radius: 18 },
  nav:            { depth: 3,  blur: 0.8, strength: 25, ca: 0,   radius: 10 },
  btn:            { depth: 3,  blur: 0.8, strength: 25, ca: 0,   radius: 12 },
  "btn-red":      { depth: 3,  blur: 0.8, strength: 25, ca: 0,   radius: 12 },
  "green-strong": { depth: 3,  blur: 0.8, strength: 25, ca: 0,   radius: 12 },
  green:          { depth: 3,  blur: 0.8, strength: 20, ca: 0,   radius: 12 },
  "banner-ok":    { depth: 4,  blur: 1,   strength: 30, ca: 0.5, radius: 16 },
  "banner-alert": { depth: 4,  blur: 1,   strength: 30, ca: 0.5, radius: 16 },
};

const cache = new Map<string, string>();

function getCacheKey(variant: string, w: number, h: number): string {
  return `${variant}-${w}-${h}`;
}

function applyFilter(el: HTMLElement) {
  const variant = el.getAttribute("data-glass");
  if (!variant) return;

  const cfg = CONFIG[variant];
  if (!cfg) return;

  const rect = el.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);
  if (w < 30 || h < 20) return;

  const key = getCacheKey(variant, w, h);
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
 * Renders nothing visible. On mount it detects SVG filter support (Chromium)
 * and enhances every [data-glass] element with the real SVG displacement filter.
 * Non-Chromium browsers keep the CSS-only fallback (blur + inset shadows).
 */
export function GlassEnhancer() {
  useEffect(() => {
    if (!detectSVGFilterSupport()) return;

    function enhanceAll() {
      document.querySelectorAll<HTMLElement>("[data-glass]").forEach(applyFilter);
    }

    requestAnimationFrame(() => requestAnimationFrame(enhanceAll));

    const mo = new MutationObserver((mutations) => {
      let needsUpdate = false;
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length > 0) {
          needsUpdate = true;
          break;
        }
        if (m.type === "attributes" && m.attributeName === "class" && m.target === document.documentElement) {
          needsUpdate = true;
          break;
        }
      }
      if (needsUpdate) requestAnimationFrame(enhanceAll);
    });

    mo.observe(document.body, { childList: true, subtree: true });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      cache.clear();
      resizeTimer = setTimeout(() => requestAnimationFrame(enhanceAll), 150);
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
