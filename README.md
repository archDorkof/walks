# Bushwalks

A record of bushwalks around Mudgee, NSW. Live at walks.mawt.info (Vercel).

## Editing

Sign in at https://app.pagescms.org with GitHub and open this repository.
- **Walks**: add or edit a walk
- **Home page**: home page text and photo
- **Media**: upload photos, maps and GPX files

Saving in Pages CMS commits to GitHub, and Vercel rebuilds the site automatically.

## How it works

- `content/walks/*.json`: one file per walk
- `content/site.json`: home page settings
- `media/`: photos, maps, GPX files
- `build.mjs`: generates the pages into `dist/` (no dependencies)
- `assets/*.css`: the design

Preview locally: `node build.mjs`, then `cd dist && python3 -m http.server`, then open http://localhost:8000.

See STYLE_GUIDE.md for writing and design rules.
