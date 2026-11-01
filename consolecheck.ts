import { chromium } from "playwright";

const OUT = (process.env.PROBE_OUT ? process.env.PROBE_OUT : "login_busy") + ".txt";
const OUT_PATH = OUT.includes("\\") ? OUT : process.env.TEMP + "\\" + OUT;
const lines: string[] = [];

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
const page = await browser.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") lines.push(`[console.${msg.type()}] ${msg.text().slice(0, 200)}`);
});
page.on("pageerror", (err) => lines.push("[pageerror] " + String(err).slice(0, 300)));

try {
  await page.goto(process.env.PROBE_URL ?? "http://localhost:3101/admin/login", { timeout: 60000, waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const email = page.locator('input[type="email"]').first();
  const pw = page.locator('input[type="password"], input[type="text"]').first();
  lines.push("email_found=" + (await email.count()) + " pw_found=" + (await pw.count()));
  await email.fill("nobody@example.com");
  await pw.fill("wrong-password-123");

  const btn = page.locator('button[type="submit"]').first();
  const t0 = Date.now();
  await btn.click();

  for (let i = 0; i < 14; i++) {
    const txt = await btn.textContent().catch(() => "ERR");
    const dis = await btn.isDisabled().catch(() => "ERR");
    lines.push(`t+${Date.now() - t0}ms text="${txt}" disabled=${dis}`);
    await new Promise((r) => setTimeout(r, 250));
  }

  // after response: spinner gone, button back to Sign in, form still filled
  await page.waitForTimeout(700);
  const finalTxt = await btn.textContent();
  lines.push("final_text=" + finalTxt);
  lines.push("final_disabled=" + (await btn.isDisabled()));
  lines.push("after_response_email_value=" + (await email.inputValue()));
} catch (e) {
  lines.push("ERROR=" + String(e).slice(0, 300));
} finally {
  await browser.close().catch(() => {});
  const { writeFileSync } = await import("fs");
  writeFileSync(OUT_PATH, lines.join("\r\n"));
}

