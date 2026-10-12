"""Pick the font weight whose stem matches the mark's stroke optically.

The mark is monoline: a single stroke weight throughout. For the wordmark to
sit with it rather than beside it, the font's stem width relative to cap
height should match the mark's stroke width relative to its own height.
"""
from fontTools.pens.boundsPen import BoundsPen
import brandkit as bk
import mark

# the mark's own ratio: stroke weight over total letter height
MARK_TOP = mark.TOP_Y - mark.SW / 2      # 206
MARK_BOT = mark.BOT_Y + mark.SW / 2      # 832
MARK_H = MARK_BOT - MARK_TOP             # 626
TARGET = mark.SW / MARK_H
print(f"mark: stroke {mark.SW:.0f} / height {MARK_H:.0f}  ->  ratio {TARGET:.4f}\n")


def stem_ratio(font_name, weight, glyph="I"):
    f = bk.load(font_name, weight)
    upm = f["head"].unitsPerEm
    gs = f.getGlyphSet()
    name = f.getBestCmap()[ord(glyph)]
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    if bp.bounds is None:
        return None
    xmin, _, xmax, _ = bp.bounds
    try:
        cap = f["OS/2"].sCapHeight
    except (KeyError, AttributeError):
        cap = upm * 0.7
    return (xmax - xmin) / cap


print("Quicksand, stem/cap by weight:")
best = None
for w in range(300, 701, 25):
    r = stem_ratio("Quicksand-var.ttf", w)
    flag = ""
    if best is None or abs(r - TARGET) < abs(best[1] - TARGET):
        best = (w, r)
    print(f"  wght {w}   {r:.4f}   delta {r - TARGET:+.4f}")
print(f"\n-> closest weight: {best[0]}  (ratio {best[1]:.4f}, "
      f"target {TARGET:.4f})\n")

print("other candidates at their natural display weight:")
for fn, w in [("Comfortaa-var.ttf", 700), ("Baloo2-var.ttf", 600),
              ("Nunito-var.ttf", 700), ("Poppins-SemiBold.ttf", None)]:
    r = stem_ratio(fn, w)
    print(f"  {fn:24} {r:.4f}   delta {r - TARGET:+.4f}")
