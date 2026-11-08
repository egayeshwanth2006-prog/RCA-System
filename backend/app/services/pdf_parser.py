import io
import logging
from typing import Tuple

logger = logging.getLogger("aivoa.pdf_parser")

def extract_text_from_pdf_bytes(pdf_bytes: bytes, filename: str = "document.pdf") -> Tuple[str, int]:
    """
    Extract text and page count from PDF bytes using PyMuPDF (fitz),
    with robust fallback to pypdf if needed.
    """
    extracted_text = ""
    num_pages = 0

    # 1. Try PyMuPDF (fitz) first as required
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        num_pages = len(doc)
        pages_text = []
        for page_idx in range(num_pages):
            page = doc[page_idx]
            page_content = page.get_text("text")
            if page_content and page_content.strip():
                pages_text.append(f"--- Page {page_idx + 1} ---\n{page_content.strip()}")
        extracted_text = "\n\n".join(pages_text)
        logger.info(f"PyMuPDF extracted {len(extracted_text)} characters from {num_pages} pages in {filename}")
        if extracted_text.strip():
            return extracted_text.strip(), num_pages
    except Exception as e:
        logger.warning(f"PyMuPDF extraction failed or fitz unavailable for {filename}: {e}. Trying fallback...")

    # 2. Fallback to pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        num_pages = len(reader.pages)
        pages_text = []
        for idx, page in enumerate(reader.pages):
            t = page.extract_text()
            if t and t.strip():
                pages_text.append(f"--- Page {idx + 1} ---\n{t.strip()}")
        extracted_text = "\n\n".join(pages_text)
        logger.info(f"pypdf fallback extracted {len(extracted_text)} characters from {num_pages} pages in {filename}")
        return extracted_text.strip(), num_pages
    except Exception as e2:
        logger.error(f"Failed to extract text from PDF {filename}: {e2}")
        raise ValueError(f"Could not read PDF file '{filename}': {str(e2)}")
