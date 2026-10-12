"""Production asset pack for direction A, tight-cropped, transparent."""
import os
import cairosvg
import brandkit as bk
from brandkit import INK, INK_DEEP, BLUSH, BROWN_SUGAR, CREAM
import mark
from finalize import stacked, horizontal

ROOT = "/projects/sandbox/bubble-blush/brand"
for d in ("logo", "icon"):
    os.makedirs(os.path.join(ROOT, d), exist_ok=True)

QS = "Quicksand-var.ttf"
A_MARK = dict(pearl=BROWN_SUGAR, show_ring=True)
A_ONE = dict(pearl=INK, show_ring=False)


def emit(path, body, w, h, png_widths=(), bg=None):
    rect = f'<rect width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>' if bg else ""
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.1f}" '
         f'height="{h:.1f}" viewBox="0 0 {w:.1f} {h:.1f}">{rect}\n{body}\n</svg>')
    with open(os.path.join(ROOT, path + ".svg"), "w") as f:
        f.write(s)
    for pw in png_widths:
        suffix = "" if len(png_widths) == 1 else f"-{pw}"
        cairosvg.svg2png(bytestring=s.encode(),
                         write_to=os.path.join(ROOT, path + suffix + ".png"),
                         output_width=pw)
    return s


# ---- full lockups -------------------------------------------------------
for name, mkw, ink, pad in [
    ("logo/stacked", A_MARK, INK, 40),
    ("logo/stacked-deep", A_MARK, INK_DEEP, 40),
    ("logo/stacked-onecolour", A_ONE, INK, 40),
]:
    body, w, h = stacked(mkw, QS, 600, "BUBBLE BLUSH", 0.10, cap=92,
                         mark_h=600, pad=pad, ink=ink)
    emit(name, body, w, h, (2400, 1200, 600))

for name, mkw, ink in [
    ("logo/horizontal", A_MARK, INK),
    ("logo/horizontal-deep", A_MARK, INK_DEEP),
    ("logo/horizontal-onecolour", A_ONE, INK),
]:
    body, w, h = horizontal(mkw, QS, 600, "BUBBLE BLUSH", 0.10, cap=92,
                            mark_h=340, pad=36, ink=ink)
    emit(name, body, w, h, (2400, 1200, 600))

# reversed, on ink -- needs a background to sit on
body, w, h = stacked(dict(pearl=BLUSH, liquid="#35696E", show_ring=False), QS, 600,
                     "BUBBLE BLUSH", 0.10, cap=92, mark_h=600, pad=70,
                     ink=CREAM, paper=INK_DEEP)
emit("logo/stacked-reversed", body, w, h, (2400, 1200), bg=INK_DEEP)

body, w, h = horizontal(dict(pearl=BLUSH, liquid="#35696E", show_ring=False), QS, 600,
                        "BUBBLE BLUSH", 0.10, cap=92, mark_h=340, pad=60,
                        ink=CREAM, paper=INK_DEEP)
emit("logo/horizontal-reversed", body, w, h, (2400, 1200), bg=INK_DEEP)

# ---- icon only ----------------------------------------------------------
BBX, BBY, BBW, BBH = 292.0, 96.0, 382.0, 736.0


def icon_body(pad=46, **kw):
    frag = mark.build(**kw)
    w = BBW + pad * 2
    h = BBH + pad * 2
    g = (f'<g transform="translate({pad - BBX:.1f},{pad - BBY:.1f})">\n'
         f'{frag}\n</g>')
    return g, w, h


b, w, h = icon_body(**A_MARK)
emit("icon/icon", b, w, h, (1024, 512, 256, 128, 64, 32))

b, w, h = icon_body(sw=64, simple_pearls=True, show_ring=False,
                    pearl=BROWN_SUGAR)
emit("icon/icon-small", b, w, h, (512, 256, 128, 96, 64, 56, 48, 32))

b, w, h = icon_body(**A_ONE)
emit("icon/icon-onecolour", b, w, h, (1024, 512, 256))

b, w, h = icon_body(sw=64, simple_pearls=True, show_ring=False,
                    pearl=BLUSH, liquid="#35696E", ink=CREAM, paper=INK_DEEP)
emit("icon/icon-reversed", b, w, h, (1024, 512, 256), bg=INK_DEEP)

# square avatar on cream, for social profiles
frag = mark.build(sw=64, simple_pearls=True, show_ring=False,
                  pearl=BROWN_SUGAR, paper=CREAM)
S = 1000
s_ = 620 / BBH
body = (f'<g transform="translate({S/2 - (BBX + BBW/2) * s_:.1f},'
        f'{S/2 - (BBY + BBH/2) * s_:.1f}) scale({s_:.5f})">\n{frag}\n</g>')
emit("icon/avatar-square", body, S, S, (1000, 512, 256), bg=CREAM)

print("asset pack written")
for dirpath, _, files in os.walk(ROOT):
    for f in sorted(files):
        if dirpath.endswith(("logo", "icon")):
            print(" ", os.path.relpath(os.path.join(dirpath, f), ROOT))
