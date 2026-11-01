(async () => {
  const base = "http://localhost:3100";
  const jar = [];

  function store(res) {
    const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const c of sc) {
      const [pair] = c.split(";");
      const idx = pair.indexOf("=");
      const name = pair.slice(0, idx);
      const rest = jar.filter((x) => !x.startsWith(name + "="));
      jar.length = 0;
      jar.push(...rest, pair);
    }
  }
  function cookieHeader() {
    return jar.join("; ");
  }

  // 1) login
  const login = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@your-gym-name.ph", password: "admin123" }),
  });
  store(login);
  console.log("login:", login.status, (await login.text()).slice(0, 120));

  // 2) hit each failing admin page
  for (const path of ["/admin/branches", "/admin/programs", "/admin/coaches", "/admin/blog", "/admin/seo", "/admin/transformations", "/admin/schedules"]) {
    try {
      const r = await fetch(base + path, { headers: { cookie: cookieHeader() }, redirect: "manual" });
      const body = await r.text();
      const isError = /server-side exception|Application error|Internal Server Error/i.test(body);
      console.log(`${path}: ${r.status} ${isError ? "❌ ERROR PAGE" : "ok " + body.length + "b"}`);
      if (isError) {
        const m = body.match(/(server-side exception[^<]*|Error:[^<]*)/i);
        console.log("   ->", m ? m[0].slice(0, 200) : "(no inline msg)");
      }
    } catch (e) {
      console.log(`${path}: FETCH THREW`, String(e).slice(0, 150));
    }
  }
})();
