import { chromium } from "playwright";

const OUT = process.env.TEMP + "\\spinner_check.txt";
const lines: string[] = [];

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--single-process", "--no-zygote"] });
const page = await browser.newPage();
try {
  await page.goto("http://localhost:3100/admin/login", { timeout: 60000 });

  // delay the auth API so the busy state is observable
  await page.route("**/api/admin/auth", async (route) => {
    await new Promise((r) => setTimeout(r, 3000));
    await route.continue();
  });

  // eye toggle present?
  const toggle = page.locator('button[aria-label="Show password"]');
  lines.push("eye_toggle_visible=" + (await toggle.isVisible()));

  // type = password initially?
  const pw = page.locator('input[type="password"]');
  lines.push("pw_field_type_password=" + (await pw.count() > 0));

  // fill dummy creds and submit -> spinner should appear while busy
  await page.fill('input[type="email"], input[name="email"], input[type="text"]', "nobody@example.com");
  await pw.fill("wrong-password-123");
  const t0 = Date.now();
  page.on("crash", () => lines.push("PAGE_CRASHED_AT_MS=" + (Date.now() - t0)));
  await page.click('button[type="submit"]');

  // IMMEDIATELY check for busy indicators (before any crash)
  for (let i = 0; i < 10; i++) {
    const busy = await page
      .locator('button[type="submit"][aria-busy="true"]')
      .count()
      .catch((e) => "ERR:" + String(e).slice(0, 60));
    const spinner = await page.locator(".login-spinner").count().catch(() => "ERR");
    lines.push(`probe${i}: busy_btn=${busy} spinner_cnt=${spinner} at=${Date.now() - t0}ms`);
    if (busy === 1 || spinner === 1) break;
    await new Promise((r) => setTimeout(r, 150));
  }

  // spinner appears during the request
  let spinnerSeen = false;
  try {
    await page.locator(".login-spinner").waitFor({ state: "visible", timeout: 8000 });
    spinnerSeen = true;
  } catch {
    spinnerSeen = false;
  }
  lines.push("spinner_seen_while_busy=" + spinnerSeen);
  lines.push("page_closed_after_click=" + page.isClosed());
  lines.push("page_crashed=" + (await page.evaluate(() => true).catch((e) => "EVAL_ERR:" + String(e).slice(0, 80))));

  // no double click: button disabled while busy
  const disabledDuring = await page.locator('button[type="submit"]').isDisabled().catch(() => "err");
  lines.push("submit_disabled_while_busy=" + disabledDuring);

  // wait for the error/finished state
  await page.waitForTimeout(5000);
  const spinnerGone = !(await page.locator(".login-spinner").isVisible().catch(() => false));
  lines.push("spinner_clears_after_done=" + spinnerGone);

  const hasAlert = await page.locator('[role="alert"]').count();
  lines.push("role_alert_after_error=" + (hasAlert > 0));
} catch (e) {
  lines.push("ERROR=" + String(e));
} finally {
  await browser.close();
  const { writeFileSync } = await import("fs");
  writeFileSync(OUT, lines.join("\r\n"));
}
