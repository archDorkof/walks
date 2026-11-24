#!/usr/bin/env python3
"""Draw a walk's route onto an A4 NSW topo map PDF, and make the files a walk page needs.

Not part of the site build: Claude (or you) runs it once per walk.
Needs: pip install pymupdf pyproj pillow numpy

Inputs
  blank PDF   an A4 export of the NSW topo sheet (no route), printed at 1:25,000
  route       a GPX or GeoJSON line (e.g. exported from CalTopo)
Outputs, into media/<slug>/
  <sheet>-route.pdf   the PDF with the route, start marker, waypoints and a footnote
  <slug>.gpx          the route as GPX (with waypoints), if the input was GeoJSON
  route-map.jpg       a crop of the route PDF around the route, for "View larger map"
  and it prints the route length.

Georeferencing: the script finds the MGA grid lines itself, but needs to know which
kilometre one vertical and one horizontal line are. Render the PDF, read one easting and
one northing label off the map, and pass the line's approximate position in PDF points
(from the top-left corner, A4 = 595 x 842 pt):
  --vline 74:228     vertical line near x=74 pt is easting 228 km (2 28 000 mE)
  --hline 698:6318   horizontal line near y=698 pt is northing 6318 km
Check the printed residual (should be under about 0.5 pt) and look at route-map.jpg.

Example:
  python3 tools/route_map.py --slug mercurys-boot --sheet ben-bullen \
    --blank media/mercurys-boot/ben-bullen-blank.pdf --route route.json \
    --vline 74:228 --hline 698:6318 --waypoint "Mercurys Boot,-33.23530,150.09201"
"""
import argparse, json, math, os, re, sys
import numpy as np
import pymupdf
from PIL import Image
from pyproj import Transformer

OCHRE = (0xc4 / 255, 0x67 / 255, 0x2d / 255)
RUST = (0x7a / 255, 0x34 / 255, 0x16 / 255)
DPI = 150
S = DPI / 72  # pixels per PDF point


def read_route(path):
    """Return (list of lines [[lon, lat], ...], waypoints [(name, lat, lon)])."""
    text = open(path, encoding='utf-8').read()
    if text.lstrip().startswith('{'):
        g = json.loads(text)
        feats = g['features'] if g.get('type') == 'FeatureCollection' else [g]
        lines, wpts = [], []
        for f in feats:
            geom = f['geometry']
            if geom['type'] == 'LineString':
                lines.append(geom['coordinates'])
            elif geom['type'] == 'MultiLineString':
                lines += geom['coordinates']
            elif geom['type'] == 'Point':
                lon, lat = geom['coordinates'][:2]
                wpts.append(((f.get('properties') or {}).get('title', ''), lat, lon))
        return lines, wpts
    lines = []
    for seg in re.findall(r'<(?:trkseg|rte)\b[\s\S]*?</(?:trkseg|rte)>', text):
        pts = re.findall(r'<(?:trkpt|rtept)\b[^>]*?lat="([^"]+)"[^>]*?lon="([^"]+)"', seg)
        pts += [(b, a) for a, b in re.findall(r'<(?:trkpt|rtept)\b[^>]*?lon="([^"]+)"[^>]*?lat="([^"]+)"', seg)]
        lines.append([[float(lon), float(lat)] for lat, lon in pts])
    wpts = [(re.search(r'<name>([^<]*)', w).group(1) if '<name>' in w else '', float(a), float(b))
            for a, b, w in re.findall(r'<wpt\b[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)</wpt>', text)]
    return [l for l in lines if len(l) > 1], wpts


def length_m(lines):
    R, rad, d = 6371000, math.radians, 0
    for l in lines:
        for (lo1, la1), (lo2, la2) in zip(l, l[1:]):
            h = math.sin(rad(la2 - la1) / 2) ** 2 + math.cos(rad(la1)) * math.cos(rad(la2)) * math.sin(rad(lo2 - lo1) / 2) ** 2
            d += 2 * R * math.asin(math.sqrt(h))
    return d


def fit_lines(pdf, vline, hline, spacing):
    """Find the grid lines in a render of the page and return an affine (E,N) -> (x,y) in points."""
    page = pymupdf.open(pdf)[0]
    W, H = page.rect.width, page.rect.height
    pix = page.get_pixmap(dpi=DPI)
    im = np.array(Image.frombytes('RGB', (pix.width, pix.height), pix.samples)).astype(int)
    mx, mn = im.max(axis=2), im.min(axis=2)
    dark = (mx < 190) & ((mx - mn) < 30)  # thin grey-black grid lines (anti-aliased)

    def fit(pos, vertical):
        if pos < 15 or pos > (W if vertical else H) - 15:
            return None
        A_, B_ = [], []
        span = range(int(30 * S), int((H - 80 if vertical else W - 20) * S))
        for t in span:
            lo, hi = int((pos - 8) * S), int((pos + 8) * S)
            c = np.where(dark[t, lo:hi] if vertical else dark[lo:hi, t])[0]
            if 0 < len(c) <= 3:
                A_.append(t); B_.append(lo + c.mean())
        if len(A_) < 60:
            return None
        a, b = np.array(A_), np.array(B_)
        for _ in range(3):
            if len(a) < 60:
                return None
            k = np.polyfit(a, b, 1); r = np.abs(np.polyval(k, a) - b); keep = r < 2
            a, b = a[keep], b[keep]
        if len(a) < 60 or abs(k[0]) > 0.06:
            return None
        return k, len(a)

    vx, ve = vline; hy, hn = hline
    V = {}
    for i in range(-8, 9):
        r = fit(vx + i * spacing, True)
        if r: V[ve + i] = r
    Hs = {}
    for i in range(-8, 9):
        r = fit(hy - i * spacing, False)  # northing increases upwards
        if r: Hs[hn + i] = r
    # keep lines whose tilt agrees with the majority (drops ones confused by other linework)
    def agree(d):
        med = np.median([v[0][0] for v in d.values()])
        return {k: v for k, v in d.items() if abs(v[0][0] - med) < 0.004}
    V, Hs = agree(V), agree(Hs)
    rows, tx, ty = [], [], []
    for e, ((a, b), _) in V.items():
        for n, ((c, d), _) in Hs.items():
            y = (c * b + d) / (1 - c * a); x = a * y + b
            rows.append([e * 1000, n * 1000, 1]); tx.append(x / S); ty.append(y / S)
    if len(rows) < 4:
        sys.exit(f'Only found {len(V)} vertical and {len(Hs)} horizontal grid lines; check --vline/--hline.')
    A = np.array(rows, float)
    cx = np.linalg.lstsq(A, tx, rcond=None)[0]; cy = np.linalg.lstsq(A, ty, rcond=None)[0]
    resid = float(np.abs(np.hstack([A @ cx - tx, A @ cy - ty])).max())
    print(f'Grid: {len(V)} eastings {sorted(V)}, {len(Hs)} northings {sorted(Hs)}; max residual {resid:.2f} pt')
    return cx, cy


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--slug', required=True)
    ap.add_argument('--sheet', required=True, help='map sheet name for filenames, e.g. ben-bullen')
    ap.add_argument('--blank', required=True, help='A4 topo PDF without the route')
    ap.add_argument('--route', required=True, help='GPX or GeoJSON route')
    ap.add_argument('--vline', required=True, help='x_pt:easting_km of one vertical grid line')
    ap.add_argument('--hline', required=True, help='y_pt:northing_km of one horizontal grid line')
    ap.add_argument('--spacing', type=float, default=72 / 25.4 * 40, help='grid spacing in pt (1 km at 1:25,000 = 40 mm)')
    ap.add_argument('--zone', type=int, default=56, help='MGA zone (55 west of 150°E, 56 east)')
    ap.add_argument('--waypoint', action='append', default=[], help='"Name,lat,lon" (repeatable)')
    ap.add_argument('--start-label', default='Start')
    a = ap.parse_args()

    out = os.path.join('media', a.slug); os.makedirs(out, exist_ok=True)
    lines, wpts = read_route(a.route)
    for w in a.waypoint:
        name, lat, lon = w.rsplit(',', 2); wpts.append((name.strip(), float(lat), float(lon)))
    print(f'Route length: {length_m(lines) / 1000:.2f} km over {len(lines)} line(s)')

    vx, ve = a.vline.split(':'); hy, hn = a.hline.split(':')
    cx, cy = fit_lines(a.blank, (float(vx), int(ve)), (float(hy), int(hn)), a.spacing)
    to_mga = Transformer.from_crs('EPSG:4326', f'EPSG:{7800 + a.zone}', always_xy=True)  # GDA2020 MGA

    def P(lon, lat):
        e, n = to_mga.transform(lon, lat)
        return pymupdf.Point(cx[0] * e + cx[1] * n + cx[2], cy[0] * e + cy[1] * n + cy[2])

    doc = pymupdf.open(a.blank); pg = doc[0]
    allpts = []
    for l in lines:
        pts = [P(*p[:2]) for p in l]; allpts += pts
        pg.draw_polyline(pts, color=(1, 1, 1), width=4.2, stroke_opacity=.8, lineCap=1, lineJoin=1)
        pg.draw_polyline(pts, color=OCHRE, width=2.6, lineCap=1, lineJoin=1)

    def label(p, txt, dx, dy):
        w = pymupdf.get_text_length(txt, fontname='helv', fontsize=7) + 4
        x0 = p.x + dx if dx >= 0 else p.x + dx - w
        r = pymupdf.Rect(x0, p.y + dy - 5, x0 + w, p.y + dy + 4)
        pg.draw_rect(r, color=None, fill=(1, 1, 1), fill_opacity=.85)
        pg.insert_text((r.x0 + 2, r.y1 - 2.3), txt, fontsize=7, fontname='helv', color=RUST)

    start = P(*lines[0][0][:2])
    pg.draw_circle(start, 3.6, color=(1, 1, 1), fill=RUST, width=1.2); label(start, a.start_label, -6, -6)
    for name, lat, lon in wpts:
        p = P(lon, lat); allpts.append(p)
        pg.draw_circle(p, 3.6, color=(1, 1, 1), fill=OCHRE, width=1.2)
        if name: label(p, name, -6, 1)
    title = f'{a.slug.replace("-", " ").title()}: approximate route in orange. walks.mawt.info'
    r = pymupdf.Rect(12, 12, 16 + pymupdf.get_text_length(title, fontname='helv', fontsize=7), 24)
    pg.draw_rect(r, color=None, fill=(1, 1, 1), fill_opacity=.85)
    pg.insert_text((15, 21), title, fontsize=7, fontname='helv', color=RUST)
    pdf_out = os.path.join(out, f'{a.sheet}-route.pdf')
    doc.save(pdf_out, garbage=3, deflate=True)

    # route-map.jpg: the route plus a margin, at least 300 x 280 pt
    xs, ys = [p.x for p in allpts], [p.y for p in allpts]
    cxm, cym = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    w = max(300, max(xs) - min(xs) + 120); h = max(280, max(ys) - min(ys) + 120)
    clip = pymupdf.Rect(cxm - w / 2, cym - h / 2, cxm + w / 2, cym + h / 2) & pg.rect
    pix = pymupdf.open(pdf_out)[0].get_pixmap(dpi=220, clip=clip)
    jpg = os.path.join(out, 'route-map.jpg')
    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(jpg, quality=85)

    gpx = os.path.join(out, f'{a.slug}.gpx')
    if a.route.lower().endswith('.gpx'):
        if os.path.abspath(a.route) != os.path.abspath(gpx):
            open(gpx, 'w').write(open(a.route).read())
    else:
        segs = ''.join('\n    <trkseg>' + ''.join(f'\n      <trkpt lat="{p[1]:.6f}" lon="{p[0]:.6f}"/>' for p in l) + '\n    </trkseg>' for l in lines)
        wx = ''.join(f'\n  <wpt lat="{lat:.6f}" lon="{lon:.6f}"><name>{n}</name></wpt>' for n, lat, lon in wpts)
        open(gpx, 'w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="walks.mawt.info" '
                             f'xmlns="http://www.topografix.com/GPX/1/1">{wx}\n  <trk>\n    <name>{a.slug}</name>{segs}\n  </trk>\n</gpx>\n')
    print('Wrote', pdf_out, jpg, gpx, sep='\n  ')


if __name__ == '__main__':
    main()
