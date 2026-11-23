# Instructions for Claude

This repo is **walks.mawt.info**: Matt's record of bushwalks around Mudgee, NSW (Warrumbungles to Wollemi). Read `STYLE_GUIDE.md` before writing any walk. It is the source of truth for voice, page structure, quick facts, photos and safety tips.

## How the site works

- One walk = one file: `content/walks/<walk-slug>.json`. Its photos, map and GPX go in `media/<walk-slug>/`.
- `build.mjs` turns the JSON into the walk page **and** the home page card. Vercel runs it on every push.
- `content/site.json` holds the home page text. You don't need to touch it to add a walk.
- `.pages.yml` configures Pages CMS (app.pagescms.org), which Matt uses to edit walks after they're added.
- **Never hand-write HTML** for a walk or the home page, and don't change `build.mjs`, `assets/*.css` or `.pages.yml` unless Matt asks. Those changes affect every walk.

## Adding a new walk

Matt will give you photos (and maybe a GPX file or a map screenshot) plus rough notes. Then:

1. **Choose the slug** from the main feature name: lower case, hyphens, e.g. `castle-rock`. Use it for both the JSON filename and the `slug` field.
2. **Prepare the photos** into `media/<walk-slug>/`:
   - Name them after what they show: `stargate-tunnel.jpg`, `route-map.jpg`.
   - Resize to about 1800 px on the long edge, JPEG quality about 85, under about 900 KB. Apply the EXIF rotation and strip location data, for example:
     `convert in.jpg -auto-orient -resize 1800x1800\> -strip -quality 85 media/<slug>/<name>.jpg`
   - Crop phone status bars or app menus off screenshots.
   - Ask Matt before using a photo where someone can be identified, unless he's said it's fine.
   - Look at each photo yourself to write accurate alt text and captions.
3. **Write the JSON** by copying `content/walks/mercurys-boot.json` and keeping exactly the same keys and structure. Change only the content.
   - Image paths look like `/media/<walk-slug>/<file>.jpg`.
   - `order`: the next number after the existing walks, unless Matt says otherwise.
   - `published`: `true`, unless Matt wants it kept as a draft.
   - `card` is the home page card: area tag, blurb (one or two sentences), two to four tags.
   - `facts` in the style guide's order (Region, Distance, Time, Climb, Grade, Walk type, Highlights, Map, Best season). Leave a fact out rather than guess.
   - `stops`: four to eight, with `highlight: true` on the two or three best. Put photos on the stops they show.
   - `tips` icons must be one of: compass, warning, water, hand, phone, fire, car, sun, gate, info.
   - Text fields: a blank line (`\n\n`) starts a new paragraph. `**bold**`, `*italic*` and `[text](https://…)` work.
4. **Use only facts Matt gives you.** Put `[X]` where a distance, time, climb, grade or measurement is missing, and list every `[X]` in your reply so he can fill them in. Never put cultural site locations on a page.
5. **Check** Australian spelling, metric units with a space (`3 km`), en dash ranges (`4–5 hrs`), day–month–year dates, and place names as on the NSW topo map or NPWS signs (no apostrophes: Mercurys Boot, McLeans Pass). Tell Matt about any spelling differences you find.
6. **Build** with `node build.mjs`. It must finish without errors and list the new walk. Open `dist/<walk-slug>/index.html` to check the page, including at phone width.
7. **Commit on a new branch and open a pull request** with the walk's title. Vercel posts a preview link on the PR. Don't merge it: Matt reviews the preview and merges, then the walk is live. After that he edits it in Pages CMS.

## Editing an existing walk

Edit its JSON file and media only, following the same rules, then build, branch and open a pull request. Matt may also have edited the file in Pages CMS, so pull the latest `main` first.
