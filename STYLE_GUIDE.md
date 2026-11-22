# Walks Around Mudgee: Style Guide

This guide covers how every walk page on **walks.mawt.info** is written, structured and styled. Follow it whenever a new walk is added, so the site reads as one consistent record.

Walk content lives in `content/walks/<slug>.json` and is edited through **Pages CMS** (app.pagescms.org). `build.mjs` turns it into pages using a fixed design. The reference walk is `content/walks/mercurys-boot.json`.

---

## 1. Purpose and audience

The site is a personal record of bushwalks around Mudgee, NSW: the Mudgee region, the Capertee and Wolgan valleys, the Gardens of Stone, Goulburn River and Wollemi edges, and nearby areas.

**Readers** are capable walkers who want enough detail to plan a walk and find the key features. They're comfortable with a map and compass. Many walks are off-track.

**The site is not** a turn-by-turn guidebook. It describes the route, the highlights and what you need to know, and it leaves navigation to the walker.

---

## 2. Voice and tone

- **First-hand and practical.** Write like an experienced local walker telling a friend how to do the walk.
- **Use the second person:** "Follow the cliffline east…", not "The walker follows…".
- **Keep it warm but plain.** One vivid image per feature is enough ("shaped unmistakably like a boot"). Avoid tourism-brochure language such as *breathtaking*, *hidden gem*, *nestled* or *must-see*.
- **Be honest about difficulty.** Say plainly when a section is rough, steep, scrubby or exposed.
- **Be confident, but don't overstate.** Use "about", "roughly" and "a kilometre or so" where the figures are estimates. Never invent distances, times or grades. Leave a placeholder (`[X]`) and ask instead.
- **Use short paragraphs:** two to four sentences each.

---

## 3. Writing conventions

| Item | Rule | Example |
|---|---|---|
| Spelling | Australian English | colour, metre, organise, kerb |
| Units | Metric, with a space before the unit | 7 m, 1.5 km, 350 m climb, 4–5 hrs |
| Dates | Day month year | 19 November 2026; short form 19/11/2026 |
| Times | 12-hour clock, lower case | 7.30 am |
| Ranges | En dash, no spaces | 4–5 hrs, 8–10 km |
| Directions | Lower case | head east, the north-west ridge |
| Numbers | Words for one to nine in prose, figures for measurements | "three passes", "3 km" |
| Grid references | Map name + 6-figure GR | Ben Bullen GR 293 188 |
| Lists | Sentence case, no full stop on short items | |

### Place names

- Use the spelling on the current NSW topographic map or NPWS signage. Where the two differ, note the alternative once: "Moffitts Trail (also signposted as Ben Bullen Trail)".
- Possessive place names have **no apostrophe** (NSW naming convention): Mercurys Boot, Moffitts Trail, McLeans Pass, Pantoneys Crown.
- Give an informal name only when walkers actually use it, and mention it once: "Mercurys Boot (also known as the Big Boot)".
- Capitalise named features (Baal Bone Gap, Capertee Valley) but not generic ones (the cliffline, the ridge, the fire trail).
- Write the terms consistently: **cliffline**, **fire trail** (two words), **off-track**, **4WD**, **bushbash** (as a verb only in informal asides).

---

## 4. Page structure

Every walk page follows this order. Keep the section names unchanged.

1. **Hero:** full-screen photo, eyebrow (park or area), title and a one-sentence lede.
2. **Quick facts card:** see section 5.
3. **Intro paragraph:** two to three sentences on what makes the walk worth doing. It uses a drop cap.
4. **01 Getting there:** one card per access option (for example "From Mudgee", "From the south"), plus a conditions note.
5. **02 The walk:** a numbered timeline of stops, with the route map beside it.
6. **Photo band (optional):** one full-width photo with a single italic line of text over it.
7. **03 Before you go:** safety and respect tips.
8. **Footer:** a back link to all walks and a link to NPWS alerts.

### Titles

- **Format:** `Main Feature & Second Feature`, or `Feature via Route`.
- Use no more than about six words, and no "The Ultimate…" or "Hike to…".
- Examples: *Mercurys Boot & the Stargate Tunnel*, *Castle Rock via the Cudgegong River*.

### Lede (hero subtitle)

One sentence of 25 words or fewer, summarising the walk type and its highlights.

### Timeline stops

- Each stop has a **kicker** (Start / Highlight / Finish / a distance such as "About 1 km east"), a **heading** (the feature name) and one paragraph.
- Tick **Highlight stop** for the two or three best features. These get the darker dot.
- Put each photo directly under the stop it shows.
- Use **Measurements** for measurable features, such as tunnel dimensions or a lookout's height.
- Aim for four to eight stops.

---

## 5. Quick facts

Use these fields in this order. Leave a field out rather than guess its value.

| Field | Format |
|---|---|
| Region | Area name, nearest locality |
| Distance | `12 km loop` / `8 km return` / `15 km one way` |
| Time | `5–6 hrs` |
| Climb | `450 m total ascent` |
| Grade | See the grading scale below |
| Walk type | Track / Partly off-track / Off-track; Loop / Return / One way (car shuffle) |
| Highlights | Two to four feature names |
| Map | `Ben Bullen 8931-4S 1:25,000` |
| Best season | for example `Autumn–spring` |

### Grading scale

The **Australian Walking Track Grading System** (Grades 1–5) is the NSW standard, but it's designed for formed tracks. This site uses its own simple scale:

| Grade | Label | Meaning |
|---|---|---|
| 1 | Easy | Formed track or fire trail, gentle grades, no navigation |
| 2 | Moderate | Mostly track, some steep or rough sections |
| 3 | Hard | Partly off-track; navigation needed; scrub or rock scrambling |
| 4 | Very hard | Fully off-track, sustained scrub, exposed scrambles, strong navigation skills required |

Show it as `Grade 3 · Hard`.

---

## 6. Visual design

### Colour palette (CSS variables)

| Token | Hex | Use |
|---|---|---|
| `--sand` | `#f4ead9` | Page background |
| `--sand-2` | `#eadbc1` | Borders, tag backgrounds |
| `--ochre` | `#c4672d` | Accent: numbers, dots, eyebrow lines, links |
| `--ochre-deep` | `#9a4a1c` | Small uppercase labels |
| `--rust` | `#7a3416` | Highlight stops, gradients, emphasis |
| `--ink` | `#2a211b` | Headings, body text |
| `--ink-soft` | `#5b4c40` | Secondary text |
| `--eucalypt` | `#5f7a5b` | Conditions/info notes only |
| Card background | `#fffaf2` | Cards, facts panel, tips |

The palette is sandstone and eucalypt. Don't add bright blues, greens or purples. Photos provide the extra colour.

### Typography

- **Headings:** *Fraunces* (serif), weight 800. Use italic 400 for the emphasised word in the title (`<em>`).
- **Body:** *Inter*, 17 px, line-height 1.7.
- **Labels and kickers:** Inter 600, 0.72–0.78 rem, uppercase, letter-spacing 0.14–0.22 em.
- Load both from Google Fonts. The `<link>` tag is in the reference page.

### Components

| Component | Class | Notes |
|---|---|---|
| Hero | `.hero` | Full-viewport photo, dark gradient at the bottom, slow zoom-in |
| Facts panel | `.facts` | Overlaps the hero by 56 px, white card with shadow |
| Section head | `.section-head` | Italic ochre number (01, 02…) above an h2 |
| Access card | `.card` + `.tag` | Rust gradient bar on the left edge |
| Info note | `.note` | Eucalypt tint, for conditions and alerts |
| Timeline | `.timeline` / `.stop` / `.dot` | Dashed ochre line, numbered circles |
| Stat pill | `.stat-pill` | Rounded tag with a bold Fraunces value |
| Photo | `figure[data-full]` | Rounded corners, caption gradient, click to enlarge |
| Photo band | `.band` | Full-width photo with an italic quote |
| Tip | `.tip` + `.icon` | Gradient icon square, 24 px stroke icon |
| Walk card (home page) | `.walk` | 4:3 photo, area tag, tags row, "Read the walk →" |

Shared details: corner radius `18px` (`--radius`), shadow `0 20px 50px -20px rgba(60,30,10,.45)`, content width `min(1150px, 92vw)`.

### Motion

Use the `.reveal` fade-up on scroll and the slow hero zoom. Both turn off under `prefers-reduced-motion`. Don't add any other animation.

---

## 7. Photos

### Choosing photos

- **Hero:** the single most striking image of the walk. Landscape orientation works best.
- **One photo per highlight stop,** plus an optional photo for the band.
- Leave room for the title in the lower-left of the hero image (sky or plain rock is ideal).
- Before you publish a photo that shows someone who can be identified, ask that person's permission.

### Files

- Put each walk's photos in its own `images/` folder.
- **Filenames:** lower-case words joined by hyphens, named after what the photo shows: `stargate-tunnel.jpg`, `route-map.jpg`.
- **Size:** about 1600–2000 px on the long edge, JPEG quality around 85, under about 900 KB each.
- Crop phone status bars and app menus off screenshots.

### Captions and alt text

- **Caption:** one short line saying where the photo is and what it shows, without a full stop. For example: *Looking through the Stargate Tunnel*.
- **Alt text:** describe what's in the photo for someone who can't see it. For example: *A walker standing on top of Mercurys Boot against a clear blue sky*.
- For a decorative band image, use `alt=""` and `aria-hidden="true"`.

---

## 8. Maps

- Every walk has a route map, saved as `images/route-map.jpg`.
- Draw the route in orange (to match `--ochre`) on a NSW topographic base map.
- The caption must name the map sheet and say the route is approximate: *Approximate route in orange. Base map: Ben Bullen 8931-4S topographic map.*
- Optionally add a GPX download link under the map.

---

## 9. Safety and respect

Every walk page includes the **Before you go** section. Always include these tips, adapted to the walk:

- **Navigation:** state plainly whether the walk is off-track and unmarked.
- **Cliffs and exposure:** include this wherever the walk passes cliff edges or involves scrambling.
- **Water:** say where (or whether) it's available, and never promise it.
- **Respect the Country:** mention any Aboriginal cultural sites without giving their exact locations. Look, don't touch, leave no trace.
- **Tell someone / PLB:** mention mobile coverage where you know it.

Add these only when they apply: 4WD access warnings, fire bans and season, flooding at river crossings, private land (and the need for permission), and park closures.

### Cultural sites

- Never give grid references or directions to rock art, grinding grooves or other cultural sites.
- Mention them in general terms only ("the area has Aboriginal cultural sites, including hand stencils").
- The Mudgee region is **Wiradjuri Country**. Check which Country each walk area is on before you name it on a page.

---

## 10. Folder and file structure

```
walks/
├── .pages.yml                 ← Pages CMS editor configuration
├── build.mjs                  ← builds the site into dist/ (Vercel runs it on every push)
├── vercel.json                ← tells Vercel to run the build
├── STYLE_GUIDE.md             ← this file
├── assets/
│   ├── walk.css               ← walk page design
│   └── home.css               ← home page design
├── content/
│   ├── site.json              ← home page text and settings
│   └── walks/
│       └── <walk-slug>.json   ← one file per walk
└── media/
    └── <walk-slug>/           ← photos, maps and GPX files for each walk
```

- **Walk slug:** lower-case words joined by hyphens, from the main feature name: `mercurys-boot`, `castle-rock`, `drip-gorge`.
- The page's address becomes `walks.mawt.info/<walk-slug>/`.
- Text fields: a blank line starts a new paragraph. `**bold**`, `*italic*` and `[link text](https://…)` work.
- The design lives in `build.mjs` (page structure) and `assets/*.css` (styling). Changing them changes every walk at once.

---

## 11. Checklist for adding a walk

1. In Pages CMS, open **Walks** and click **Add an entry**.
2. Upload photos into a new `media/<walk-slug>/` folder, named according to the filename rules.
3. Fill in the title, web address (slug), area, summary and main photo.
4. Add the quick facts, and leave out any field you don't know.
5. Add the access options, the route stops (with photos on the highlights), the route map and the Before you go tips.
6. Add the home page card's tag, blurb and tags.
7. Check the spelling (Australian), units (metric) and place names (topo spelling, no apostrophes).
8. Save. Vercel rebuilds the site and the walk is live in about a minute. Untick **Show on site** to keep a draft hidden.

---

## 12. Instructions for Claude

When you help write or build a walk for this site:

- Produce the walk as a JSON file matching `content/walks/mercurys-boot.json` exactly: same keys, same structure. Change only the content.
- Don't hand-write HTML pages. The pages are generated by `build.mjs`.
- Use only the facts Matt provides. Leave `[X]` placeholders for missing distances, times, grades or measurements, and ask for them.
- Check place-name spellings against NPWS or topographic sources where you can, and tell Matt about any differences.
- Image paths take the form `/media/<walk-slug>/<file>.jpg`.
- Tip icons must be one of: compass, warning, water, hand, phone, fire, car, sun, gate, info.
- Use Australian spelling, metric units and day–month–year dates throughout.
