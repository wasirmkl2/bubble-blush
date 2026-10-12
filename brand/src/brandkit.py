"""Bubble Blush brand asset toolkit.

Builds the logo as pure SVG geometry with all type converted to vector
outlines, so the output files are printer-safe and font-independent.
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
_cache = {}


def load(name, weight=None):
    """Load a font, pinning a weight if it's a variable font."""
    key = (name, weight)
    if key in _cache:
        return _cache[key]
    f = TTFont(os.path.join(FONTS, name))
    if weight is not None and "fvar" in f:
        f = instancer.instantiateVariableFont(f, {"wght": weight}, inplace=False)
    _cache[key] = f
    return f


def text_to_path(text, font_name, size, weight=None, tracking=0.0, word_space=0.0):
    """Convert a string to a single SVG path, origin at the text baseline/left.

    tracking   -- extra space between letters, in em units (0.05 = 5% of size)
    word_space -- extra space at spaces, in em units, on top of the space glyph
    Returns (path_data, advance_width).
    """
    font = load(font_name, weight)
    upm = font["head"].unitsPerEm
    glyphset = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / upm
    track_u = tracking * upm
    wordsp_u = word_space * upm

    pen = SVGPathPen(glyphset, ntos=lambda v: f"{v:.2f}")
    x = 0.0
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            continue
        g = glyphset[name]
        # record, then replay through a transform that flips Y and positions it
        rec = RecordingPen()
        g.draw(rec)
        tp = TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0))
        rec.replay(tp)
        x += g.width + track_u
        if ch == " ":
            x += wordsp_u
    # trailing tracking isn't real advance
    width = (x - track_u) * scale if text else 0.0
    return pen.getCommands(), width


def cap_height(font_name, size, weight=None):
    font = load(font_name, weight)
    upm = font["head"].unitsPerEm
    try:
        ch = font["OS/2"].sCapHeight
    except (KeyError, AttributeError):
        ch = upm * 0.7
    return ch / upm * size


# ---------------------------------------------------------------- palette
INK = "#3F797E"          # gray-cyan, the brand ink, full strength
INK_DEEP = "#2F5F64"     # deeper teal, for signage punch
BLUSH = "#F2B8B5"        # blush pink accent
BLUSH_SOFT = "#F9DCDA"   # pale blush, for fills
BROWN_SUGAR = "#A87E5A"  # boba pearl brown
SAGE = "#8F9C8B"         # supporting sage
CREAM = "#F9F4EF"        # paper
WHITE = "#FFFFFF"
GOLD = "#C2A05A"        # muted gold, the collar in the original logo
