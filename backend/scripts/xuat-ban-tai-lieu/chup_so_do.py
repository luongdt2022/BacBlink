"""Chụp các sơ đồ SVG nội tuyến trong tài liệu markdown thành ảnh PNG,
rồi dựng một bản markdown thay SVG bằng ảnh để pandoc xuất được sang Word.

Dùng: python chup_so_do.py <tep.md> <thu_muc_lam_viec> <duong_dan_chrome>
"""

from __future__ import annotations

import html as htmlmod
import pathlib
import re
import subprocess
import sys

FIGURE = re.compile(r'<figure class="fig">(.*?)</figure>', re.S)
SVG = re.compile(r"<svg.*?</svg>", re.S)
CAPTION = re.compile(r"<figcaption>(.*?)</figcaption>", re.S)
VIEWBOX = re.compile(r'viewBox="0 0 ([\d.]+) ([\d.]+)"')


def main() -> int:
    if len(sys.argv) != 4:
        raise SystemExit("Cần truyền tệp markdown, thư mục làm việc và đường dẫn Chrome.")

    src = pathlib.Path(sys.argv[1]).resolve()
    work = pathlib.Path(sys.argv[2]).resolve()
    chrome = pathlib.Path(sys.argv[3]).resolve()
    work.mkdir(parents=True, exist_ok=True)

    text = src.read_text(encoding="utf-8")
    blocks = list(FIGURE.finditer(text))
    print(f"Số sơ đồ: {len(blocks)}")

    replacements: list[tuple[tuple[int, int], str]] = []
    for index, block in enumerate(blocks, 1):
        inner = block.group(1)
        svg = SVG.search(inner).group(0)
        caption = htmlmod.unescape(re.sub(r"\s+", " ", CAPTION.search(inner).group(1).strip()))

        box = VIEWBOX.search(svg)
        width, height = float(box.group(1)), float(box.group(2))

        page = (
            "<!doctype html><meta charset='utf-8'>"
            "<style>html,body{margin:0;padding:0;background:#fff}"
            f"svg{{display:block;width:{width}px;height:{height}px}}</style>" + svg
        )
        page_path = work / f"fig{index:02d}.html"
        page_path.write_text(page, encoding="utf-8")

        png = work / f"fig{index:02d}.png"
        png.unlink(missing_ok=True)
        subprocess.run(
            [
                str(chrome),
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--hide-scrollbars",
                "--force-device-scale-factor=2",
                "--default-background-color=FFFFFFFF",
                f"--window-size={int(width)},{int(height)}",
                f"--screenshot={png}",
                page_path.as_uri(),
            ],
            capture_output=True,
            check=False,
        )
        if not png.exists():
            raise SystemExit(f"Không chụp được sơ đồ {index}.")

        print(f"  fig{index:02d}: {int(width)}x{int(height)} -> {png.stat().st_size} B")
        replacements.append((block.span(), f"![{caption}]({png.as_posix()})\n\n*{caption}*"))

    out = text
    for (start, end), replacement in reversed(replacements):
        out = out[:start] + replacement + out[end:]

    target = work / "for_docx.md"
    target.write_text(out, encoding="utf-8")
    print(f"Đã dựng: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
