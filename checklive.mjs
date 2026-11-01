import { writeFileSync } from "node:fs";

const LOG = "checklive_out.txt";
const BASE = "https://real-estate-website-w29x.vercel.app";
const out = [];
const log = (s) => {
  out.push(s);
  try { writeFileSync(LOG, out.join("\n"), "utf8"); } catch {}
};

const paths = [
  "/", "/listings", "/about", "/contact", "/blog", "/neighborhoods",
  "/past-sales", "/testimonials", "/faq", "/sell", "/sell/home-valuation",
  "/buy/mortgage-calculator", "/sitemap", "/team", "/legal/privacy-notice",
  "/api/health", "/sitemap.xml", "/robots.txt",
  "/media/brand/favicon.svg", "/media/brand/favicon-admin.svg",
  "/media/brand/apple-touch-icon.png", "/media/brand/favicon.ico",
  "/media/listings/pe-2001/living.jpg", "/media/listings/pe-2002/studio.jpg",
  "/favicon.ico",
  "/admin", "/admin/login", "/admin/system", "/admin/homepage", "/admin/legal",
];

log("START " + new Date().toISOString());

for (const p of paths) {
  try {
    const r = await fetch(BASE + p, { signal: AbortSignal.timeout(25000), redirect: "manual" });
    let extra = "";
    if (p === "/api/health") extra = "  " + (await r.text()).slice(0, 500);
    log(String(r.status).padEnd(4) + " " + p + extra);
  } catch (e) {
    log("ERR  " + p + " -> " + String(e.message).slice(0, 90));
  }
}

log("");
log("=== FAVICON / META ON / ===");
try {
  const r = await fetch(BASE + "/", { signal: AbortSignal.timeout(25000) });
  const h = await r.text();
  for (const m of h.matchAll(/<link rel="[^"]*icon[^"]*"[^>]*>/g)) log("  " + m[0]);
  for (const m of h.matchAll(/<link rel="canonical"[^>]*>/g)) log("  " + m[0]);
  const hosts = [...new Set(
    (h.match(/https?:\/\/[a-z0-9.-]+/gi) || []).filter(
      (u) => !u.includes("w3.org") && !u.includes("schema.org") &&
             !u.includes("googleapis") && !u.includes("gstatic"),
    ),
  )];
  log("  hosts: " + hosts.join(" | "));
} catch (e) { log("  ERR " + e.message); }

log("DONE");
