# Instructions for Claude

This repo is **walks.mawt.info**: Matt's record of bushwalks around Mudgee, NSW (Warrumbungles to Wollemi). Read `STYLE_GUIDE.md` before writing any walk. It is the source of truth for voice, page structure, quick facts, photos and safety tips.

## How the site works

- One walk = one file: `content/walks/<walk-slug>.json`. Its photos, map and GPX go in `media/<walk-slug>/`.
- `build.mjs` turns the JSON into the walk page **and** the home page card. Vercel runs it on every push.
- `content/site.json` holds the home page text. You don't need to touch it to add a walk.
- `tools/route_map.py` draws a walk's route onto a topo map PDF (run by hand, not part of the build).
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
3. **Make the route map.** This is the standard map format for every walk (see `STYLE_GUIDE.md` section 8):
   - Ask Matt for (a) the route as a GPX or GeoJSON file, e.g. drawn in CalTopo (Add → Line, then Export), and (b) an A4 PDF export of the NSW topo sheet around the walk at 1:25,000, with no route on it.
   - Save the blank PDF as `media/<walk-slug>/<sheet>-blank.pdf` (e.g. `ben-bullen-blank.pdf`).
   - Render it, read one easting and one northing grid label, and run
     `python3 tools/route_map.py --slug <walk-slug> --sheet <sheet> --blank media/<walk-slug>/<sheet>-blank.pdf --route <route file> --vline <x_pt>:<easting_km> --hline <y_pt>:<northing_km> --waypoint "<Feature>,<lat>,<lon>"`
     (needs `pip install pymupdf pyproj pillow numpy`). It writes `<sheet>-route.pdf`, `route-map.jpg` and `<walk-slug>.gpx`, and prints the route length. Check the residual it prints is under about 0.5 pt, and look at `route-map.jpg` to confirm the route follows the tracks and cliffs it should.
   - In the JSON `map`: `image` = route-map.jpg, `gpx`, `pdf` = the route PDF, `pdf_blank` = the blank PDF. The page then shows the interactive map with Hide route, View larger map, Download PDF map and Download GPX buttons.
   - Use the measured length for the Distance fact (`node build.mjs` also prints it). GPX files drawn in CalTopo have no heights, so ask Matt for the total climb from CalTopo's elevation profile.
4. **Write the JSON** by copying `content/walks/mercurys-boot.json` and keeping exactly the same keys and structure. Change only the content.
   - Image paths look like `/media/<walk-slug>/<file>.jpg`.
   - `order`: the next number after the existing walks, unless Matt says otherwise.
   - `published`: `true`, unless Matt wants it kept as a draft.
   - `card` is the home page card: area tag, blurb (one or two sentences), two to four tags.
   - `facts` in the style guide's order (Region, Distance, Time, Climb, Grade, Walk type, Highlights, Map, Best season). Leave a fact out rather than guess.
   - `stops`: four to eight, with `highlight: true` on the two or three best. Put photos on the stops they show.
   - `tips` icons must be one of: compass, warning, water, hand, phone, fire, car, sun, gate, info.
   - Text fields: a blank line (`\n\n`) starts a new paragraph. `**bold**`, `*italic*` and `[text](https://…)` work.
5. **Use only facts Matt gives you.** Put `[X]` where a distance, time, climb, grade or measurement is missing, and list every `[X]` in your reply so he can fill them in. Never put cultural site locations on a page.
6. **Check** Australian spelling, metric units with a space (`3 km`), en dash ranges (`4–5 hrs`), day–month–year dates, and place names as on the NSW topo map or NPWS signs (no apostrophes: Mercurys Boot, McLeans Pass). Tell Matt about any spelling differences you find.
7. **Build** with `node build.mjs`. It must finish without errors and list the new walk. Open `dist/<walk-slug>/index.html` to check the page, including at phone width.
8. **Commit on a new branch and open a pull request** with the walk's title. Vercel posts a preview link on the PR. Don't merge it: Matt reviews the preview and merges, then the walk is live. After that he edits it in Pages CMS.

## Editing an existing walk

Edit its JSON file and media only, following the same rules, then build, branch and open a pull request. Matt may also have edited the file in Pages CMS, so pull the latest `main` first.
