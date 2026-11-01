(async () => {
  const BASE = "http://localhost:3100";
  const cookie = [];
  async function hit(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (cookie.length) headers.cookie = cookie.join("; ");
    const r = await fetch(BASE + path, { ...opts, headers, redirect: "manual" });
    const sc = r.headers.get("set-cookie");
    if (sc) { cookie.length = 0; cookie.push(sc.split(";")[0]); }
    return { status: r.status, path };
  }
  const login = await hit("/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@your-gym-name.ph", password: "admin123" }),
  });
  console.log("login", login.status);
  const pages = [
    "/admin", "/admin/branches", "/admin/programs", "/admin/coaches",
    "/admin/blog", "/admin/seo", "/admin/schedules", "/admin/transformations",
    "/admin/inquiries", "/admin/content", "/admin/reports", "/admin/users", "/admin/audit",
  ];
  const results = [];
  for (const p of pages) {
    const r = await hit(p);
    results.push(r);
    console.log(r.status, p);
  }
  const bad = results.filter((r) => r.status >= 500);
  console.log(bad.length === 0 ? "ALL_200_NO_5XX" : "HAS_5XX:" + JSON.stringify(bad));
})().catch((e) => console.log("ERR", String(e)));
