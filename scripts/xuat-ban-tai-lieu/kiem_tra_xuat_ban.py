from pathlib import Path
import sys

import fitz
from docx import Document


def main() -> int:
    if len(sys.argv) != 4:
        raise SystemExit("Cần truyền tệp Word, tệp PDF và ảnh xem trước.")

    word_path = Path(sys.argv[1]).resolve()
    pdf_path = Path(sys.argv[2]).resolve()
    preview_path = Path(sys.argv[3]).resolve()

    word = Document(word_path)
    section = word.sections[0]
    print(
        "DOCX_PAGE_MM="
        f"{section.page_width.mm:.1f}x{section.page_height.mm:.1f} "
        "MARGINS_MM="
        f"{section.top_margin.mm:.1f}/"
        f"{section.right_margin.mm:.1f}/"
        f"{section.bottom_margin.mm:.1f}/"
        f"{section.left_margin.mm:.1f}"
    )

    pdf = fitz.open(pdf_path)
    try:
        print(f"PDF_PAGES={pdf.page_count}")
        print(f"PDF_TEXT_CHARS={sum(len(page.get_text()) for page in pdf)}")
        first_page = pdf[0]
        image = first_page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        image.save(preview_path)
    finally:
        pdf.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
