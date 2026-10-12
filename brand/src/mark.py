"""The Bubble Blush 'B' mark: a boba cup built as a letterform.

Geometry lives in a 1000x1000 space. Construction:
  spine        -- the vertical stem of the B
  top bowl     -- upper bowl; its top bar doubles as the sealed cup lid
  middle bar   -- doubles as the liquid surface line
  bottom bowl  -- the cup body, holding liquid and pearls
  straw        -- pierces the lid, drops into the liquid

Draw order matters: liquid, straw-in-liquid, pearls (in front of the straw,
as real pearls sit), bowl outlines, then the straw's upper length with a
short paper-coloured halo ONLY where it crosses the lid bar. The halo is
deliberately short -- a full-length halo carves chunks out of the pearls.
"""
import math
from brandkit import INK, BLUSH, BLUSH_SOFT, BROWN_SUGAR, CREAM, WHITE

# --- letterform skeleton -------------------------------------------------
SPINE_X = 318.0
TOP_Y = 232.0       # lid line
MID_Y = 506.0       # liquid surface
BOT_Y = 806.0       # cup base
TOP_BOWL_X = 478.0
BOT_BOWL_X = 498.0
R_TOP = (MID_Y - TOP_Y) / 2       # 137
R_BOT = (BOT_Y - MID_Y) / 2       # 150
BOT_CY = MID_Y + R_BOT            # 656

SW = 52.0

# straw endpoints: (x0, y0) in the liquid -> (x1, y1) above the lid
STRAW_V = (424.0, 650.0, 424.0, 118.0)
STRAW_T = (378.0, 650.0, 520.0, 118.0)

PEARLS = [(400, 726, 38), (492, 735, 34), (560, 705, 30)]
PEARLS_BIG = [(410, 718, 46), (515, 725, 38)]


def _axis(s):
    x0, y0, x1, y1 = s
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    return dx / L, dy / L


def _at_y(s, y):
    """Point on the straw at a given y."""
    x0, y0, x1, y1 = s
    t = (y - y0) / (y1 - y0)
    return x0 + (x1 - x0) * t, y


def _bottom_bowl_fill():
    return (f"M {SPINE_X} {MID_Y} H {BOT_BOWL_X} "
            f"A {R_BOT} {R_BOT} 0 0 1 {BOT_BOWL_X} {BOT_Y} H {SPINE_X} Z")


def _spine():
    return f"M {SPINE_X} {TOP_Y} V {BOT_Y}"


def _top_bowl():
    return (f"M {SPINE_X} {TOP_Y} H {TOP_BOWL_X} "
            f"A {R_TOP} {R_TOP} 0 0 1 {TOP_BOWL_X} {MID_Y} H {SPINE_X}")


def _bottom_bowl():
    return (f"M {SPINE_X} {MID_Y} H {BOT_BOWL_X} "
            f"A {R_BOT} {R_BOT} 0 0 1 {BOT_BOWL_X} {BOT_Y} H {SPINE_X}")


def _seg(s, ya, yb):
    xa, _ = _at_y(s, ya)
    xb, _ = _at_y(s, yb)
    return f"M {xa:.1f} {ya:.1f} L {xb:.1f} {yb:.1f}"


def _halo(s, reach=46):
    """A short run of straw centred on the lid crossing."""
    ux, uy = _axis(s)
    cx, cy = _at_y(s, TOP_Y)
    return (f"M {cx - ux * reach:.1f} {cy - uy * reach:.1f} "
            f"L {cx + ux * reach:.1f} {cy + uy * reach:.1f}")


def _ring(s, sw):
    """Band across the straw, just above the lid: the puncture collar."""
    ux, uy = _axis(s)
    px, py = -uy, ux                      # perpendicular
    cx, cy = _at_y(s, TOP_Y - 52)
    half = (sw - 8) / 2
    return (f"M {cx - px * half:.1f} {cy - py * half:.1f} "
            f"L {cx + px * half:.1f} {cy + py * half:.1f}")


def build(pearl=INK, liquid="#EAF1F2", ink=INK, sw=SW, tilt=False,
          solid_bowl=False, show_ring=True, ring_color=BROWN_SUGAR,
          simple_pearls=False, paper=CREAM, halo=0):
    """Return an SVG fragment for the mark, drawn in a 1000x1000 box.

    halo -- extra width of the paper-coloured gap where the straw crosses the
            lid bar. 0 means straw and bar merge in the same ink, which keeps
            the letterform fully intact.
    """
    s = STRAW_T if tilt else STRAW_V
    straw_w = sw - 8
    pearls = PEARLS_BIG if simple_pearls else PEARLS
    cap = (f'stroke="{ink}" stroke-width="{sw}" fill="none" '
           f'stroke-linecap="round" stroke-linejoin="round"')
    p = []

    if solid_bowl:
        p.append(f'<path d="{_bottom_bowl_fill()}" fill="{ink}"/>')
        p.append(f'<path d="{_bottom_bowl()}" {cap}/>')
        # straw knocked out of the solid body, stopping short of the pearls
        p.append(f'<path d="{_seg(s, s[1], MID_Y)}" stroke="{paper}" '
                 f'stroke-width="{straw_w}" fill="none" stroke-linecap="round"/>')
        for cx, cy, r in pearls:
            p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{paper}"/>')
        p.append(f'<path d="{_bottom_bowl()}" {cap}/>')
    else:
        p.append(f'<path d="{_bottom_bowl_fill()}" fill="{liquid}"/>')
        # straw inside the liquid, drawn first so the pearls sit in front
        p.append(f'<path d="{_seg(s, s[1], MID_Y)}" stroke="{ink}" '
                 f'stroke-width="{straw_w}" fill="none" stroke-linecap="round"/>')
        for cx, cy, r in pearls:
            p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{pearl}"/>')
        p.append(f'<path d="{_bottom_bowl()}" {cap}/>')

    p.append(f'<path d="{_top_bowl()}" {cap}/>')
    p.append(f'<path d="{_spine()}" {cap}/>')

    if halo:
        p.append(f'<path d="{_halo(s)}" stroke="{paper}" '
                 f'stroke-width="{straw_w + halo}" fill="none" '
                 f'stroke-linecap="butt"/>')
    p.append(f'<path d="{_seg(s, MID_Y, s[3])}" stroke="{ink}" '
             f'stroke-width="{straw_w}" fill="none" stroke-linecap="round"/>')

    if show_ring:
        p.append(f'<path d="{_ring(s, sw)}" stroke="{ring_color}" '
                 f'stroke-width="30" fill="none" stroke-linecap="butt"/>')

    return "\n".join("    " + x for x in p)


# --- the six directions --------------------------------------------------
VARIANTS = {
    "01-refined": dict(
        label="Refined original",
        note="Your logo, fixed. Full-strength ink, consistent pearls, clean lid crossing.",
        kw=dict(pearl=INK, show_ring=True),
    ),
    "02-brown-sugar": dict(
        label="Brown sugar pearls",
        note="Same shape, pearls in boba brown. Reads as tapioca, not abstract dots.",
        kw=dict(pearl=BROWN_SUGAR, show_ring=True),
    ),
    "03-tilted-straw": dict(
        label="Tilted straw",
        note="Straw leans out. Unmistakably a straw, and the B stops reading as an H.",
        kw=dict(pearl=BROWN_SUGAR, tilt=True, show_ring=True),
    ),
    "04-blush": dict(
        label="Teal + blush",
        note="Teal ink, blush liquid. The name finally connects to the colour.",
        kw=dict(pearl=BROWN_SUGAR, liquid=BLUSH_SOFT, show_ring=True,
                ring_color=BLUSH),
    ),
    "05-signage": dict(
        label="Signage solid",
        note="Cup body filled solid, pearls knocked out. Maximum punch at distance.",
        kw=dict(solid_bowl=True, show_ring=False, sw=56),
    ),
    "06-minimal": dict(
        label="Minimal icon",
        note="Two large pearls, heavier stroke, no ring. Survives a profile picture.",
        kw=dict(pearl=BROWN_SUGAR, sw=64, simple_pearls=True, show_ring=False),
    ),
}
