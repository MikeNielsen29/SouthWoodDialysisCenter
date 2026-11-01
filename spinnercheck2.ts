import { chromium } from "playwright";

const OUT = process.env.TEMP + "\\spinner_check.txt";
const lines: string[] = [];

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
try {
  await page.goto("http://localhost:3100/admin/login", { timeout: 60000 });

  // delay the auth API so the busy state is observable
  await page.route("**/api/admin/auth", async (route) => {
    await new Promise((r) => setTimeout(r, 3000));
    await route.continue();
  });

  // 1) hydration proof: click the eye toggle, input type should flip
  const pw = page.locator('input[type="password"], input[type="text"]').first();
  const before = await pw.getAttribute("type");
  await page.locator('button[aria-label="Show password"]').first().click();
  await page.waitForTimeout(300);
  const after = await pw.getAttribute("type");
  lines.push(`hydration_toggle: before=${before} after=${after} works=${before !== after}`);

  // 2) submit and watch the busy state on the LIVE button
  const email = page.locator('input[type="email"]').first();
  lines.push("email_field_found=" + (await email.count()));
  await email.fill("nobody@example.com");
  await pw.fill("wrong-password-123");

  const submitBtn = page.locator('button[type="submit"]').first();
  const t0 = Date.now();
  const beforeText = await submitBtn.textContent();
  await submitBtn.click();

  for (let i = 0; i < 12; i++) {
    const txt = await submitBtn.textContent().catch((e) => "ERR:" + String(e).slice(0, 50));
    const dis = await submitBtn.isDisabled().catch(() => "ERR");
    const url = page.url();
    lines.push(`t+${Date.now() - t0}ms text="${txt}" disabled=${dis} url=${url}`);
    if (String(txt).includes("wait")) break;
    await new Promise((r) => setTimeout(r, 250));
  }

  lines.push("before_text=" + beforeText);
} catch (e) {
  lines.push("ERROR=" + String(e).slice(0, 200));
} finally {
  await browser.close().catch(() => {});
  const { writeFileSync } = await import("fs");
  writeFileSync(OUT, lines.join("\r\n"));
}
