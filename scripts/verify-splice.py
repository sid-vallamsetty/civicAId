"""Verify that each saved sprite PNG's content matches the same region
of the source sheet by comparing identical non-background pixels."""

from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    r"C:\Users\wg\.cursor\projects\c-Users-wg-OneDrive-Documents-GitHub-civicAId"
    r"\assets\c__Users_wg_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_260a6641bd717aa46628eaf19612a7c4_images_image-5cacc294-ff27-4586-825e"
    r"-5fba5efd8054.png"
)
OUT_DIR = REPO_ROOT / "civicaid" / "public" / "sprites"

COLS, ROWS = 3, 2
PAD_L, PAD_T = 20, 82

LAYOUT = [
    ("house",       0, 0),
    ("townhall",    1, 0),
    ("park",        2, 0),
    ("school",      0, 1),
    ("city-center", 1, 1),
    ("flowers",     2, 1),
]

sheet = Image.open(SRC).convert("RGB")
W, H = sheet.size
cell_w = W / COLS
cell_h = H / ROWS

# Sample several sprite-interior pixel offsets (relative to crop origin)
probes = [(50, 150), (150, 150), (250, 150), (150, 80), (150, 230)]

for name, col, row in LAYOUT:
    ox = int(col * cell_w) + PAD_L
    oy = int(row * cell_h) + PAD_T
    png = Image.open(OUT_DIR / f"{name}.png").convert("RGB")

    hits = 0
    samples = []
    for px, py in probes:
        if px >= png.size[0] or py >= png.size[1]:
            continue
        src_px = sheet.getpixel((ox + px, oy + py))
        png_px = png.getpixel((px, py))
        match = all(abs(a - b) < 3 for a, b in zip(src_px, png_px))
        hits += 1 if match else 0
        samples.append((src_px, png_px, match))
    status = "OK" if hits >= 3 else "MISMATCH"
    print(f"{name:12s} {status}  hits={hits}/{len(samples)}  first sample sheet={samples[0][0]} png={samples[0][1]}")
