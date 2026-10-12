"""Full production pack for every one of the six directions.

Wordmark is Quicksand 500 throughout -- chosen because it shares the mark's
construction (monoline, rounded terminals, smaller top bowl than bottom) and
because weight 500 sits with the mark without competing with it.
"""
import os
import shutil
import cairosvg
import brandkit as bk
from brandkit import (INK, INK_DEEP, BLUSH, BLUSH_SOFT, BROWN_SUGAR, SAGE,
                      CREAM, WHITE, GOLD)
import mark
from render import place, svg
from finalize import stacked, horizontal, sized_for_cap

ROOT = "/projects/sandbox/bubble-blush/brand/directions"
QS = "Quicksand-var.ttf"
WT = 500                 # the chosen wordmark weight
TEXT = "BUBBLE BLUSH"
TRACK = 0.10
REV_LIQUID = "#35696E"   # drink tone when the logo is reversed out of ink

BBX, BBY, BBW, BBH = 292.0, 96.0, 382.0, 736.0

# base, reversed, one-colour and small-icon settings for each direction
DIRECTIONS = [
    dict(
        key="01-refined", label="Refined original",
        note="Your logo, faithfully. Teal pearls, gold collar, full-strength ink.",
        base=dict(pearl=INK, liquid="#EAF1F2", show_ring=True, ring_color=GOLD),
        small=dict(pearl=INK, sw=64, simple_pearls=True, show_ring=False),
    ),
    dict(
        key="02-brown-sugar", label="Brown sugar pearls",
        note="Same shape, pearls in boba brown. Reads as tapioca.",
        base=dict(pearl=BROWN_SUGAR, liquid="#EAF1F2", show_ring=True),
        small=dict(pearl=BROWN_SUGAR, sw=64, simple_pearls=True, show_ring=False),
    ),
    dict(
        key="03-tilted-straw", label="Tilted straw",
        note="Straw leans out. Unmistakably a straw.",
        base=dict(pearl=BROWN_SUGAR, liquid="#EAF1F2", tilt=True, show_ring=True),
        small=dict(pearl=BROWN_SUGAR, sw=64, simple_pearls=True, tilt=True,
                   show_ring=False),
    ),
    dict(
        key="04-teal-blush", label="Teal + blush",
        note="Teal ink, blush drink. The name and the colour agree.",
        base=dict(pearl=BROWN_SUGAR, liquid=BLUSH_SOFT, show_ring=True,
                  ring_color=BLUSH),
        small=dict(pearl=BROWN_SUGAR, liquid=BLUSH_SOFT, sw=64,
                   simple_pearls=True, show_ring=False),
    ),
    dict(
        key="05-signage-solid", label="Signage solid",
        note="Cup body filled solid, pearls knocked out. Strongest at distance.",
        base=dict(solid_bowl=True, show_ring=False, sw=56),
        small=dict(solid_bowl=True, show_ring=False, sw=64, simple_pearls=True),
    ),
    dict(
        key="06-minimal", label="Minimal icon",
        note="Two large pearls, heavier stroke. Built for small sizes.",
        base=dict(pearl=BROWN_SUGAR, liquid="#EAF1F2", sw=64,
                  simple_pearls=True, show_ring=False),
        small=dict(pearl=BROWN_SUGAR, sw=70, simple_pearls=True,
                   show_ring=False),
    ),
]


def reversed_of(base):
    """Cream-on-deep-ink version of a direction."""
    r = dict(base)
    r.update(ink=CREAM, paper=INK_DEEP, pearl=BLUSH, liquid=REV_LIQUID,
             show_ring=False)
    r.pop("ring_color", None)
    if base.get("solid_bowl"):
        r.update(pearl=INK_DEEP, liquid=None)
    return {k: v for k, v in r.items() if v is not None}


def onecolour_of(base):
    """Single-ink version: no second colour, no tint."""
    o = dict(base)
    o.update(pearl=INK, liquid="none", show_ring=False)
    o.pop("ring_color", None)
    if base.get("solid_bowl"):
        o.update(paper=WHITE)
        o.pop("liquid", None)
        o.pop("pearl", None)
    return o


def emit(path, body, w, h, png_widths, bg=None):
    rect = f'<rect width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>' if bg else ""
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.1f}" '
         f'height="{h:.1f}" viewBox="0 0 {w:.1f} {h:.1f}">{rect}\n{body}\n</svg>')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path + ".svg", "w") as f:
        f.write(s)
    for pw in png_widths:
        cairosvg.svg2png(bytestring=s.encode(),
                         write_to=f"{path}-{pw}.png", output_width=pw)


def icon_body(pad=46, **kw):
    frag = mark.build(**kw)
    return (f'<g transform="translate({pad - BBX:.1f},{pad - BBY:.1f})">\n'
            f'{frag}\n</g>'), BBW + pad * 2, BBH + pad * 2


if os.path.isdir(ROOT):
    shutil.rmtree(ROOT)

for d in DIRECTIONS:
    out = os.path.join(ROOT, d["key"])
    base, small = d["base"], d["small"]
    rev, one = reversed_of(base), onecolour_of(base)

    # --- lockups
    for name, mkw, ink, paper, bg in [
        ("stacked", base, INK, CREAM, None),
        ("stacked-deep", base, INK_DEEP, CREAM, None),
        ("stacked-reversed", rev, CREAM, INK_DEEP, INK_DEEP),
        ("stacked-onecolour", one, INK, WHITE, None),
    ]:
        pad = 70 if bg else 40
        body, w, h = stacked(mkw, QS, WT, TEXT, TRACK, cap=92, mark_h=600,
                             pad=pad, ink=ink, paper=paper)
        emit(os.path.join(out, name), body, w, h, (2000, 800), bg=bg)

    for name, mkw, ink, paper, bg in [
        ("horizontal", base, INK, CREAM, None),
        ("horizontal-deep", base, INK_DEEP, CREAM, None),
        ("horizontal-reversed", rev, CREAM, INK_DEEP, INK_DEEP),
        ("horizontal-onecolour", one, INK, WHITE, None),
    ]:
        pad = 60 if bg else 36
        body, w, h = horizontal(mkw, QS, WT, TEXT, TRACK, cap=92, mark_h=340,
                                pad=pad, ink=ink, paper=paper)
        emit(os.path.join(out, name), body, w, h, (2000, 800), bg=bg)

    # --- icons
    b, w, h = icon_body(**base)
    emit(os.path.join(out, "icon"), b, w, h, (512, 256, 128, 64, 32))
    b, w, h = icon_body(**small)
    emit(os.path.join(out, "icon-small"), b, w, h, (128, 96, 64, 48, 32))
    b, w, h = icon_body(**one)
    emit(os.path.join(out, "icon-onecolour"), b, w, h, (512, 256, 128))
    b, w, h = icon_body(**rev)
    emit(os.path.join(out, "icon-reversed"), b, w, h, (512, 256, 128),
         bg=INK_DEEP)

    # --- square avatar on cream
    frag = mark.build(paper=CREAM, **{k: v for k, v in small.items()
                                      if k != "paper"})
    S, s_ = 1000, 620 / BBH
    body = (f'<g transform="translate({S/2 - (BBX + BBW/2) * s_:.1f},'
            f'{S/2 - (BBY + BBH/2) * s_:.1f}) scale({s_:.5f})">\n{frag}\n</g>')
    emit(os.path.join(out, "avatar-square"), body, S, S, (1000, 512, 256),
         bg=CREAM)

    print(f"  {d['key']}: {len(os.listdir(out))} files")

print("\nall six direction packs written")
