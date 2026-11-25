// Builds the static site from content/*.json into dist/.
// Run: node build.mjs   (Vercel runs this automatically on every push)
// No dependencies needed.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist');
// The live address, used for canonical links, social previews, sitemap.xml and robots.txt.
const SITE_URL = 'https://walks.mawt.info';
const abs = (p = '') => /^https?:\/\//.test(p) ? p : SITE_URL + (p.startsWith('/') ? p : '/' + p);

// ---------- helpers ----------
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Inline formatting after escaping: **bold**, *italic*, [text](url)
const inline = (s = '') =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_, t, u) =>
      `<a href="${u}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);

// Blank lines become new paragraphs
const paras = (s = '') =>
  String(s).trim().split(/\n\s*\n/).filter(Boolean).map(p => `<p>${inline(p.trim())}</p>`).join('\n        ');

// "A & B" -> "A <em>&amp;</em> B" for display titles
const fancyTitle = (s = '') => esc(s).replace(/ &amp; /g, ' <em>&amp;</em> ');

const ICONS = {
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9"/>',
  warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/>',
  water: '<path d="M12 2.7s-6 6.6-6 11.3a6 6 0 0 0 12 0c0-4.7-6-11.3-6-11.3z"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L2.9 16.4a2 2 0 0 1 2.8-2.8L7 15"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.6 1.4 2.8 2.5 2.8z"/>',
  car: '<path d="M5 17h14v-5l-2-5H7l-2 5v5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><line x1="5" y1="12" x2="19" y2="12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  gate: '<rect x="3" y="4" width="18" height="16" rx="1"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/>'
};
const icon = name => `<svg viewBox="0 0 24 24">${ICONS[name] || ICONS.info}</svg>`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`;

const REVEAL_JS = `const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));`;

// Favicon and home-screen icons (assets/icons/), linked on every page.
const FAVICONS = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/assets/icons/site.webmanifest">
<meta name="theme-color" content="#c4672d">`;

// ---------- route map ----------
// With a GPX file: an interactive NSW topo map with Hide route, PDF and GPX buttons.
// Without one: the static map image. Either way, download links for the files.
function mapPanel(m) {
  if (!m || !(m.image || m.gpx)) return '';
  // One PDF button. With a route toggle, it follows the toggle: the route PDF while the
  // route is shown, the blank PDF while it's hidden.
  const pdf = m.pdf || m.pdf_blank;
  const pdfBtn = pdf ? `<a class="gpx alt pdf-btn" href="${esc(pdf)}" download
          data-route="${esc(m.pdf || m.pdf_blank)}" data-blank="${esc(m.pdf_blank || m.pdf)}">Download PDF map</a>` : '';
  if (m.gpx) return `<aside class="map-panel reveal">
      <div class="topo-wrap">
        <div class="topo" data-gpx="${esc(m.gpx)}" role="region" aria-label="${esc(m.alt || 'Interactive topographic map of the route')}"></div>
        ${m.caption ? `<p class="map-caption">${esc(m.caption)}</p>` : ''}
      </div>
      <div class="downloads">
        <button type="button" class="gpx route-btn" aria-pressed="true">Hide route</button>
        ${m.image ? `<button type="button" class="gpx alt" data-full="${esc(m.image)}" data-alt="${esc(m.alt)}">View larger map</button>` : ''}
        ${pdfBtn}
        <a class="gpx alt" href="${esc(m.gpx)}" download>Download GPX</a>
      </div>
    </aside>`;
  return `<aside class="map-panel reveal">
      <figure data-full="${esc(m.image)}">
        <img src="${esc(m.image)}" alt="${esc(m.alt)}">
        ${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ''}
      </figure>
      <div class="downloads">
        ${pdfBtn || `<a class="gpx alt" href="${esc(m.image)}" download>Download map</a>`}
      </div>
    </aside>`;
}

const LEAFLET_CSS = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">';
const LEAFLET_JS = '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>';

// NSW Spatial Services topographic basemap (CC BY 4.0) + the GPX route in ochre.
const TOPO_JS = `document.querySelectorAll('.topo[data-gpx]').forEach(async el => {
    const map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer('https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16, maxZoom: 18,
      attribution: '&copy; <a href="https://www.spatial.nsw.gov.au" target="_blank" rel="noopener">Spatial Services NSW</a>'
    }).addTo(map);
    map.setView([-33.2, 150.1], 13);
    const xml = new DOMParser().parseFromString(await (await fetch(el.dataset.gpx)).text(), 'application/xml');
    const pts = el => [...el.querySelectorAll('trkpt, rtept')].map(p => [+p.getAttribute('lat'), +p.getAttribute('lon')]);
    const lines = [...xml.querySelectorAll('trkseg, rte')].map(pts).filter(l => l.length > 1);
    const route = L.featureGroup(lines.map(l => L.polyline(l, { color: '#c4672d', weight: 5, opacity: .9 })));
    if (lines.length) L.circleMarker(lines[0][0], { radius: 7, color: '#fff', weight: 2, fillColor: '#7a3416', fillOpacity: 1 }).bindTooltip('Start', { permanent: true, direction: 'left', className: 'map-label' }).addTo(route);
    xml.querySelectorAll('wpt').forEach(w => L.circleMarker([+w.getAttribute('lat'), +w.getAttribute('lon')], { radius: 6, color: '#fff', weight: 2, fillColor: '#c4672d', fillOpacity: 1 })
      .bindTooltip(w.querySelector('name')?.textContent || '', { permanent: true, direction: 'right', className: 'map-label' }).addTo(route));
    route.addTo(map);
    if (lines.length) map.fitBounds(route.getBounds(), { padding: [24, 24] });
    // "Hide route" removes the route, markers and labels, leaving the plain topo map.
    const panel = el.closest('.map-panel'), btn = panel.querySelector('.route-btn'), pdf = panel.querySelector('.pdf-btn');
    btn.addEventListener('click', () => {
      const show = btn.getAttribute('aria-pressed') !== 'true';
      show ? route.addTo(map) : route.remove();
      btn.setAttribute('aria-pressed', show);
      btn.textContent = show ? 'Hide route' : 'Show route';
      if (pdf) pdf.href = show ? pdf.dataset.route : pdf.dataset.blank;
      const cap = panel.querySelector('.map-caption'); if (cap) cap.style.visibility = show ? '' : 'hidden';
    });
  });`;

// Distance and climb from a GPX file, printed when the site builds (to fill in the quick facts).
function gpxStats(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const segs = [...xml.matchAll(/<(trkseg|rte)\b[\s\S]*?<\/\1>/g)].map(m =>
    [...m[0].matchAll(/<(?:trkpt|rtept)\b([^>]*?)\/>|<(?:trkpt|rtept)\b([^>]*)>([\s\S]*?)<\/(?:trkpt|rtept)>/g)].map(p => {
      const a = p[1] || p[2] || '';
      const ele = /<ele>([^<]+)<\/ele>/.exec(p[3] || '');
      return { lat: +/lat="([^"]+)"/.exec(a)[1], lon: +/lon="([^"]+)"/.exec(a)[1], ele: ele ? +ele[1] : null };
    }));
  const R = 6371000, rad = d => d * Math.PI / 180;
  let dist = 0, up = 0;
  for (const seg of segs) for (let i = 1; i < seg.length; i++) {
    const a = seg[i - 1], b = seg[i];
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
    dist += 2 * R * Math.asin(Math.sqrt(h));
    if (a.ele != null && b.ele != null && b.ele > a.ele) up += b.ele - a.ele;
  }
  return { km: (dist / 1000).toFixed(1), climb: Math.round(up), hasEle: segs.some(s => s.some(p => p.ele != null)) };
}

// ---------- walk page ----------
function walkPage(w) {
  const gt = w.getting_there || {};
  const stops = (w.stops || []).map((s, i) => `
      <li class="stop${s.highlight ? ' highlight' : ''} reveal">
        <span class="dot">${i + 1}</span>
        ${s.kicker ? `<span class="kicker">${esc(s.kicker)}</span>` : ''}
        <h3>${esc(s.heading)}</h3>
        ${paras(s.text)}
        ${(s.pills || []).map(p => `<span class="stat-pill">${esc(p.label)} <b>${esc(p.value)}</b></span>`).join('\n        ')}
        ${s.image ? `<figure${s.image_tall ? ' class="tall"' : ''} data-full="${esc(s.image)}">
          <img src="${esc(s.image)}" alt="${esc(s.image_alt)}" loading="lazy">
          ${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}
        </figure>` : ''}
      </li>`).join('');

  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(w.title)} | Bushwalks around Mudgee</title>
<meta name="description" content="${esc(w.description)}">
<link rel="canonical" href="${SITE_URL}/${esc(w.slug)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${SITE_URL}/${esc(w.slug)}">
<meta property="og:title" content="${esc(w.title)}">
<meta property="og:description" content="${esc(w.description)}">
${w.hero_image ? `<meta property="og:image" content="${esc(abs(w.hero_image))}">` : ''}
${FAVICONS}
${FONTS}
${w.map && w.map.gpx ? LEAFLET_CSS : ''}
<link rel="stylesheet" href="/assets/walk.css">
</head>
<body>

<header class="hero">
  <a class="back" href="/">&larr; All walks</a>
  <img src="${esc(w.hero_image)}" alt="${esc(w.hero_alt)}">
  <div class="hero-inner">
    <span class="eyebrow">${esc(w.area)}</span>
    <h1>${fancyTitle(w.title)}</h1>
    <p class="lede">${inline(w.lede)}</p>
  </div>
  <div class="scroll-cue" aria-hidden="true"></div>
</header>

${(w.facts || []).length ? `<div class="facts reveal">
  ${w.facts.map(f => `<div class="fact"><div class="label">${esc(f.label)}</div><div class="value">${esc(f.value)}</div></div>`).join('\n  ')}
</div>` : ''}

${w.intro ? `<section>
  <p class="intro reveal">${inline(w.intro)}</p>
</section>` : ''}

<section id="getting-there">
  <div class="section-head reveal">
    <span class="num">01</span>
    <h2>Getting there</h2>
    ${gt.intro ? `<p>${inline(gt.intro)}</p>` : ''}
  </div>
  <div class="access">
    ${(gt.options || []).map(o => `<article class="card reveal">
      ${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ''}
      <h3>${esc(o.heading)}</h3>
      ${paras(o.text)}
    </article>`).join('\n    ')}
  </div>
  ${gt.note ? `<p class="note reveal">${inline(gt.note)}</p>` : ''}
</section>

<section id="the-walk">
  <div class="section-head reveal">
    <span class="num">02</span>
    <h2>The walk</h2>
    ${w.walk_intro ? `<p>${inline(w.walk_intro)}</p>` : ''}
  </div>

  <div class="route-wrap">
    <ol class="timeline">${stops}
    </ol>

    ${mapPanel(w.map)}
  </div>
</section>

${w.band && w.band.image ? `<div class="band reveal">
  <img src="${esc(w.band.image)}" alt="" aria-hidden="true" loading="lazy">
  ${w.band.quote ? `<blockquote>${esc(w.band.quote)}</blockquote>` : ''}
</div>` : ''}

<section id="before-you-go">
  <div class="section-head reveal">
    <span class="num">03</span>
    <h2>Before you go</h2>
  </div>
  <div class="tips">
    ${(w.tips || []).map(t => `<div class="tip reveal">
      <div class="icon">${icon(t.icon)}</div>
      <h3>${esc(t.heading)}</h3>
      ${paras(t.text)}
    </div>`).join('\n    ')}
  </div>
</section>

<footer>
  <div class="inner">
    <span>${esc(w.title)} · ${esc(w.area)}</span>
    <span><a href="/">&larr; All walks</a> · Check conditions: <a href="https://www.nationalparks.nsw.gov.au/alert/state-alerts" target="_blank" rel="noopener">NSW National Parks alerts</a></span>
  </div>
</footer>

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Enlarged photo">
  <button aria-label="Close">&times;</button>
  <img alt="">
</div>

<script>
  ${REVEAL_JS}
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('[data-full]').forEach(fig => {
    fig.addEventListener('click', () => {
      lbImg.src = fig.dataset.full;
      lbImg.alt = fig.dataset.alt || fig.querySelector('img')?.alt || '';
      lb.classList.add('open');
    });
  });
  const close = () => lb.classList.remove('open');
  lb.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
</script>
${w.map && w.map.gpx ? `${LEAFLET_JS}
<script>
  ${TOPO_JS}
</script>` : ''}
</body>
</html>
`;
}

// ---------- home page ----------
function homePage(site, walks) {
  const cards = walks.map(w => {
    const c = w.card || {};
    return `<a class="walk reveal" href="/${esc(w.slug)}/">
      <div class="pic">
        <img src="${esc(c.image || w.hero_image)}" alt="${esc(c.image_alt || w.hero_alt)}" loading="lazy">
        ${c.area_tag ? `<span class="area">${esc(c.area_tag)}</span>` : ''}
      </div>
      <div class="body">
        <h3>${esc(w.title)}</h3>
        <p>${inline(c.blurb || w.lede)}</p>
        ${(c.tags || []).length ? `<div class="tags">${c.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <span class="more">Read the walk</span>
      </div>
    </a>`;
  }).join('\n\n    ');

  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.site_name)} around Mudgee, NSW | mawt.info</title>
<meta name="description" content="${esc(site.meta_description)}">
<link rel="canonical" href="${SITE_URL}/">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}/">
<meta property="og:title" content="${esc(site.site_name)} around Mudgee, NSW">
<meta property="og:description" content="${esc(site.meta_description)}">
${site.hero_image ? `<meta property="og:image" content="${esc(abs(site.hero_image))}">` : ''}
${FAVICONS}
${FONTS}
<link rel="stylesheet" href="/assets/home.css">
</head>
<body>

<header class="hero">
  <img src="${esc(site.hero_image)}" alt="${esc(site.hero_alt)}">
  <div class="hero-inner">
    <span class="eyebrow">${esc(site.eyebrow)}</span>
    <h1>${esc(site.title_main)}<em>${esc(site.title_em)}</em></h1>
    <p>${inline(site.lede)}</p>
  </div>
</header>

<section id="walks">
  <div class="section-head reveal">
    <h2>${esc(site.walks_heading)}</h2>
    <span>${walks.length} ${walks.length === 1 ? 'walk' : 'walks'}</span>
  </div>

  <div class="grid">
    ${cards}
    ${site.coming_soon ? `
    <div class="coming reveal">
      <div>
        <h3>More walks coming</h3>
        <p>New routes will be added here.</p>
      </div>
    </div>` : ''}
  </div>

  <div class="safety reveal">
    <div class="icon">${icon('warning')}</div>
    <div>
      <h3>${esc(site.safety_heading)}</h3>
      ${paras(site.safety_text)}
    </div>
  </div>
</section>

<footer>
  <div class="inner">
    <span>${esc(site.footer_left)}</span>
    <span>${esc(site.footer_right)}</span>
  </div>
</footer>

<script>
  ${REVEAL_JS}
</script>
</body>
</html>
`;
}

// ---------- build ----------
const readJSON = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const slugify = s => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const site = readJSON(path.join(ROOT, 'content/site.json'));
const walkDir = path.join(ROOT, 'content/walks');
const walks = fs.readdirSync(walkDir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const w = readJSON(path.join(walkDir, f));
    w.slug = slugify(w.slug || w.title || path.basename(f, '.json'));
    return w;
  })
  .filter(w => w.published !== false)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));

for (const w of walks) {
  const dir = path.join(OUT, w.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), walkPage(w));
  console.log(`  built /${w.slug}/`);
  const gpx = w.map && w.map.gpx && path.join(ROOT, w.map.gpx.replace(/^\//, ''));
  if (gpx && fs.existsSync(gpx)) {
    const g = gpxStats(gpx);
    console.log(`    GPX route: ${g.km} km${g.hasEle ? `, ${g.climb} m total ascent` : ' (no elevation data)'}`);
  }
}
fs.writeFileSync(path.join(OUT, 'index.html'), homePage(site, walks));
console.log('  built / (home)');

// sitemap.xml lists the home page and every published walk, so new walks are picked up
// by search engines automatically. robots.txt points to it.
const urls = [`${SITE_URL}/`, ...walks.map(w => `${SITE_URL}/${w.slug}`)];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
console.log(`  built /sitemap.xml (${urls.length} pages) and /robots.txt`);

for (const d of ['assets', 'media']) {
  if (fs.existsSync(path.join(ROOT, d))) fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
}
// Browsers also ask for /favicon.ico at the site root.
fs.copyFileSync(path.join(ROOT, 'assets/icons/favicon.ico'), path.join(OUT, 'favicon.ico'));
console.log(`Done: ${walks.length} walk(s) -> dist/`);
