"""
Splice the 3x2 building sprite sheet into individual transparent PNGs.

Source image: a 1024x895 sheet with HOUSE / TOWN HALL / PARK on row 1
and SCHOOL / CITY CENTER / FLOWERS on row 2. Each card has a label,
a building sprite, and a "XXX pts" label. We crop out only the sprite
region of each card (excluding the text) and flood-fill the beige card
background with transparency from all four corners.

Run:
    python scripts/splice-sprites.py path/to/source.png

Outputs to civicaid/public/sprites/*.png
"""

import argparse
from pathlib import Path
from PIL import Image, ImageDraw

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = REPO_ROOT / "public" / "sprites"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Grid of cards on the sheet
COLS, ROWS = 3, 2

# How much to trim inside each card cell (pixels). Tuned for a 1024x895 sheet.
PAD_L = 20
PAD_R = 20
PAD_T = 82   # skip card border + "HOUSE" / "TOWN HALL" / etc. title row
PAD_B = 100  # skip "xxx pts" label + bottom padding

# Beige-card flood-fill tolerance (0 disables fill)
BG_THRESH = 48

# Row-major order matches the visual sheet (top-left to bottom-right)
LAYOUT = [
    ("house",       0, 0),
    ("townhall",    1, 0),
    ("park",        2, 0),
    ("school",      0, 1),
    ("city-center", 1, 1),
    ("flowers",     2, 1),
]


def strip_background(img: Image.Image, thresh: int) -> Image.Image:
    """Flood-fill transparent from all four corners so the beige card
    background drops out while the building sprite stays intact."""
    w, h = img.size
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        try:
            ImageDraw.floodfill(img, seed, (0, 0, 0, 0), thresh=thresh)
        except Exception as e:  # noqa: BLE001 — tolerate off-sheet seeds
            print(f"  floodfill {seed} failed: {e}")
    return img


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="source sprite sheet")
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    if not source.is_file():
        parser.error("source must be a file")
    sheet = Image.open(source).convert("RGBA")
    W, H = sheet.size
    cell_w = W / COLS
    cell_h = H / ROWS
    print(f"Sheet: {W}x{H}  cell: {cell_w:.1f}x{cell_h:.1f}")

    for name, col, row in LAYOUT:
        x0 = int(col * cell_w) + PAD_L
        y0 = int(row * cell_h) + PAD_T
        x1 = int((col + 1) * cell_w) - PAD_R
        y1 = int((row + 1) * cell_h) - PAD_B
        crop = sheet.crop((x0, y0, x1, y1)).copy()
        crop = strip_background(crop, BG_THRESH)
        out_path = OUT_DIR / f"{name}.png"
        crop.save(out_path, "PNG")
        print(f"  {name:12s} -> {out_path.relative_to(REPO_ROOT)}  {crop.size}")


if __name__ == "__main__":
    main()
