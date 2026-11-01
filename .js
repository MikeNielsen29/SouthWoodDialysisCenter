(async () => {
  const get = async (u) => { const r = await fetch(u); return { s: r.status, h: await r.text() } };
  const branch = await get('http://localhost:3100/branches/qc-flagship');
  console.log('branch page:', branch.s, 'google-map-iframe:', branch.h.includes('google.com/maps?q='), 'maps-link:', branch.h.includes('google.com/maps/search/?api=1'));
  const home = await get('http://localhost:3100/');
  const count = (home.h.match(/google\.com\/maps\?q=/g) || []).length;
  console.log('home page:', home.s, 'map-iframes:', count);
  const idx = await get('http://localhost:3100/branches');
  const count2 = (idx.h.match(/google\.com\/maps\?q=/g) || []).length;
  console.log('branches index:', idx.s, 'map-iframes:', count2);
})();
