#!/usr/bin/env python3
"""
photos-web.py — resize graded photos for the web.

Takes the full-resolution output of grade.py and produces delivery-sized
JPEGs. This is a resize + re-encode ONLY: aspect ratio is preserved exactly,
nothing is cropped, and no tonal adjustment happens here (the grade already
ran and must not be touched).

  long edge -> 1800px (Lanczos), JPEG q82, progressive, sRGB tagged.

1800px is a deliberate choice: the lightbox frame maxes out at 820px CSS
(components/trips/PhotoLightbox.tsx), so 1800 covers a 2x retina display with
headroom, and next/image downscales from there for the grid thumbnails.

Also writes dimensions.json — real width/height per photo, so lib/trips.ts can
carry true aspect ratios instead of guessed ones.

Usage:
  python3.11 scripts/photos-web.py SRC_DIR -o OUT_DIR

Requires: pillow
"""

import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageCms

LONG_EDGE = 1800
QUALITY = 82

SRGB_BYTES = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()

# Source folder name -> trip slug in lib/trips.ts. The folders carry a sort
# prefix and sometimes a year the slug does not, so this cannot be derived.
SLUGS = {
    "01-buenos-aires-2022": "buenos-aires-2022",
    "02-foz-do-iguacu-2022": "foz-do-iguacu",
    "03-camboriu-2022": "camboriu",
    "04-santiago-de-chile-2023": "santiago",
    "05-medellin-2023": "medellin-2023",
    "06-buenos-aires-2024": "buenos-aires-2024",
    "07-medellin-2024": "medellin-2024",
    "08-montevideo-2025": "montevideo",
    "09-san-francisco-2025": "san-francisco",
    "10-miami-2025": "miami",
    "11-florianopolis-2026": "florianopolis",
}


def resize(src: Path, dst: Path) -> tuple[int, int]:
    img = Image.open(src)
    if img.mode != "RGB":
        img = img.convert("RGB")

    w, h = img.size
    scale = LONG_EDGE / max(w, h)
    if scale < 1:
        target = (round(w * scale), round(h * scale))
        img = img.resize(target, Image.LANCZOS)

    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(
        dst,
        "JPEG",
        quality=QUALITY,
        optimize=True,
        progressive=True,
        icc_profile=SRGB_BYTES,
    )
    return img.size


def main():
    ap = argparse.ArgumentParser(description="Resize graded photos for the web.")
    ap.add_argument("src", help="folder of graded per-trip subfolders")
    ap.add_argument("-o", "--out", required=True, help="output directory")
    args = ap.parse_args()

    src_root, out_root = Path(args.src), Path(args.out)
    manifest: dict[str, list[dict]] = {}

    for folder in sorted(d for d in src_root.iterdir() if d.is_dir()):
        slug = SLUGS.get(folder.name)
        if not slug:
            print(f"skip (no slug mapping): {folder.name}")
            continue

        photos = []
        for f in sorted(folder.glob("*.jpg"), key=lambda p: p.name):
            n = re.sub(r"\D", "", f.stem) or f.stem
            dst = out_root / slug / f"{n.zfill(2)}.jpg"
            w, h = resize(f, dst)
            photos.append({"file": dst.name, "w": w, "h": h,
                           "kb": round(dst.stat().st_size / 1024)})
        manifest[slug] = photos
        total = sum(p["kb"] for p in photos)
        print(f"{slug}: {len(photos)} photos, {total}KB")

    (out_root / "dimensions.json").write_text(json.dumps(manifest, indent=2))
    grand = sum(p["kb"] for v in manifest.values() for p in v)
    print(f"\ntotal: {sum(len(v) for v in manifest.values())} photos, "
          f"{grand / 1024:.1f}MB")


if __name__ == "__main__":
    main()
