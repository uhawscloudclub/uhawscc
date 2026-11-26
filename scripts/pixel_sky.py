"""Original pixel-art sky for the CloudHub UH site: layered violet sky bands,
pixel clouds, stars, a yellow moon. Deterministic (fixed seed).
Usage: python pixel_sky.py OUT.png WIDTH HEIGHT [wide|tall]"""
import random, sys
from PIL import Image

W, H = int(sys.argv[2]), int(sys.argv[3])
MODE = sys.argv[4] if len(sys.argv) > 4 else "wide"
rnd = random.Random(20261126)
img = Image.new("RGB", (W, H))
px = img.load()

def hexrgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
# Sky bands, top (deep) to bottom (bright), ending in the page base colour.
BANDS = [hexrgb(c) for c in ["#1d1550", "#241a63", "#2b2072", "#33268a", "#3b2c9c", "#4532ad"]]
BASE = hexrgb("#2b2072")  # page background below the hero
CLOUD = {"shadow": hexrgb("#5a44c8"), "body": hexrgb("#7b63e6"), "light": hexrgb("#a493f5"), "glint": hexrgb("#d9d0ff")}
PINK = hexrgb("#c45bd8")
STAR, GOLD, GOLD_DARK = hexrgb("#ffffff"), hexrgb("#ffd34d"), hexrgb("#e9a93a")

# 1) Sky: horizontal bands with a 2x2 ordered dither at each boundary.
band_h = H / len(BANDS)
for y in range(H):
    b = min(int(y / band_h), len(BANDS) - 1)
    frac = (y - b * band_h) / band_h
    for x in range(W):
        c = BANDS[b]
        if b + 1 < len(BANDS) and frac > 0.75 and (x + y) % 2 == 0:
            c = BANDS[b + 1]
        px[x, y] = c

def behind_text(x, y):
    """Where the hero heading, intro and buttons sit: no stars or clouds."""
    if MODE == "wide":
        return x < W * 0.65 and H * 0.1 < y < H * 0.74
    return H * 0.14 < y < H * 0.8 and x < W * 0.97

# 2) Stars: white singles, a few gold four-point twinkles, never behind text.
for _ in range(int(W * H / 320)):
    x, y = rnd.randrange(W), rnd.randrange(int(H * 0.7))
    if not behind_text(x, y):
        px[x, y] = STAR if rnd.random() > 0.25 else CLOUD["glint"]
placed = 0
while placed < max(3, W // 60):
    x, y = rnd.randrange(3, W - 3), rnd.randrange(3, int(H * 0.6))
    if behind_text(x, y):
        continue
    for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]:
        px[x + dx, y + dy] = GOLD
    placed += 1

# 3) Moon (upper right), shaded on its lower-left.
if MODE == "wide":
    mx, my, r = int(W * 0.82), int(H * 0.2), max(5, H // 12)
else:  # phones: small, tucked into the top-right corner above the heading
    mx, my, r = int(W * 0.84), int(H * 0.07), max(4, W // 20)
for y in range(my - r, my + r + 1):
    for x in range(mx - r, mx + r + 1):
        if (x - mx) ** 2 + (y - my) ** 2 <= r * r and 0 <= x < W and 0 <= y < H:
            px[x, y] = GOLD_DARK if (x - mx) + (y - my) > r * 0.55 else GOLD

# 4) Pixel clouds: unions of circles with a flat base; shadow underneath,
#    light on top, a glint rim. Bigger and denser toward the bottom.
def cloud(cx, cy, scale, tint=None):
    puffs = [(cx + dx * scale, cy - abs(dy) * scale, rr * scale)
             for dx, dy, rr in [(-2.2, 0.3, 1.5), (-0.8, 1.2, 2.0), (0.9, 0.9, 1.8), (2.3, 0.2, 1.4), (0, 0, 1.6)]]
    base = cy + scale * 1.0
    shape = set()
    for x in range(int(cx - 5 * scale), int(cx + 5 * scale) + 1):
        for y in range(int(cy - 4 * scale), int(base) + 1):
            if 0 <= x < W and 0 <= y < H and any((x - a) ** 2 + (y - b) ** 2 <= rr * rr for a, b, rr in puffs):
                shape.add((x, y))
    for (x, y) in shape:
        rel = (y - (cy - 3 * scale)) / (4 * scale)
        c = CLOUD["light"] if rel < 0.45 else CLOUD["body"] if rel < 0.8 else CLOUD["shadow"]
        if (x, y - 1) not in shape:
            c = CLOUD["glint"] if tint is None else tint
        px[x, y] = c

# Clouds stay out of the area behind the hero text: on wide images the left
# 55% above the cloud bank; on tall (phone) images everything above it.
if MODE == "wide":
    for _ in range(max(4, W // 45)):  # small distant clouds, upper right
        cloud(rnd.randrange(int(W * 0.7), W), rnd.randrange(int(H * 0.3), int(H * 0.6)), rnd.uniform(1.4, 2.4),
              tint=PINK if rnd.random() < 0.3 else None)
    for _ in range(max(5, W // 30)):  # bigger clouds along the bottom
        cloud(rnd.randrange(-10, W + 10), rnd.randrange(int(H * 0.74), int(H * 0.9)), rnd.uniform(2.6, 4.2))
    for _ in range(3):
        cloud(rnd.randrange(int(W * 0.6), W + 10), rnd.randrange(int(H * 0.62), int(H * 0.74)), rnd.uniform(2.6, 3.6))
else:
    for _ in range(6):
        cloud(rnd.randrange(-8, W + 8), rnd.randrange(int(H * 0.8), int(H * 0.92)), rnd.uniform(2.6, 3.8),
              tint=PINK if rnd.random() < 0.2 else None)

# 5) Cloud bank melting into the page colour, so the hero blends into what follows.
for x in range(W):
    top = int(H * 0.9) + int(2 * ((x * 7) % 5) / 4)
    for y in range(top, H):
        px[x, y] = BASE if y > top + 1 or (x + y) % 2 else CLOUD["shadow"]

img.save(sys.argv[1], optimize=True)
print(sys.argv[1], img.size)
