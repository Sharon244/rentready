from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
from docx import Document
from app.services.ai_service import explain_tenancy

router = APIRouter()
MAX_SIZE = 8 * 1024 * 1024

def extract_text(filename: str, content: bytes) -> str:
    try:
        name = filename.lower()
        if name.endswith(".pdf"):
            return "\\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(content)).pages)
        if name.endswith(".docx"):
            return "\\n".join(p.text for p in Document(BytesIO(content)).paragraphs)
        if name.endswith(".txt"):
            return content.decode("utf-8", errors="replace")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read document: {exc}")
    raise HTTPException(status_code=400, detail="Upload a PDF, DOCX or TXT file.")

@router.post("/analyse")
async def analyse(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required.")
    raw = await file.read()
    if len(raw) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Maximum file size is 8 MB.")
    text = extract_text(file.filename, raw).strip()
    if not text:
        raise HTTPException(status_code=400, detail="No readable text found. Scanned PDFs need OCR.")
    return await explain_tenancy(text[:40000])
