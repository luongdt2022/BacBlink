from pathlib import Path
import sys

from docx import Document
from docx.shared import Mm, Pt, RGBColor


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("Cần truyền đường dẫn tệp Word.")

    path = Path(sys.argv[1]).resolve()
    document = Document(path)

    document.core_properties.title = "Kiến trúc hệ thống NacenTech"
    document.core_properties.subject = "Tài liệu kiến trúc chuẩn"

    for section in document.sections:
        section.page_width = Mm(210)
        section.page_height = Mm(297)
        section.top_margin = Mm(18)
        section.bottom_margin = Mm(18)
        section.left_margin = Mm(17)
        section.right_margin = Mm(17)

    normal = document.styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(10)

    for style_name in ("Title", "Heading 1", "Heading 2", "Heading 3", "Heading 4"):
        if style_name not in document.styles:
            continue
        style = document.styles[style_name]
        style.font.name = "Aptos Display"
        style.font.color.rgb = RGBColor(18, 54, 90)

    if "Title" in document.styles:
        document.styles["Title"].font.size = Pt(24)
        document.styles["Title"].font.bold = True

    if "Subtitle" in document.styles:
        document.styles["Subtitle"].font.name = "Aptos"
        document.styles["Subtitle"].font.size = Pt(14)

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()
        if text == "Mục lục":
            paragraph.paragraph_format.page_break_before = True
        if text == "1. Kết luận kiến trúc":
            paragraph.paragraph_format.page_break_before = True

    document.save(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
