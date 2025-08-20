import os
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import Base, engine, get_db
from models import Company, ResearchNote, Export
from schemas import (
    GenerateRequest, GenerateResponse, Framework,
    NoteCreate, NoteUpdate, NoteOut,
    ExportRequest, ExportOut,
)
from ai import generate_research
from exporter import build_markdown, export_markdown, export_docx, export_pdf

load_dotenv()

# --- App
app = FastAPI(title="Equity Research Backend")

# --- CORS
allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB init (ensure all tables exist at startup)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# --- Static exports (serve files)
EXPORT_DIR = os.getenv("EXPORT_DIR", "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=EXPORT_DIR), name="static")

# ---------- AI: Generate ----------
import json

@app.post("/api/ai/generate", response_model=GenerateResponse)
async def ai_generate(req: GenerateRequest):
    try:
        raw_data = generate_research(req.company, req.ticker, req.sector, req.country)

        # --- If AI returned string, parse JSON safely ---
        if isinstance(raw_data, str):
            try:
                data = json.loads(raw_data)
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="AI returned invalid JSON")
        else:
            data = raw_data

        # --- Validate structure ---
        questions = data.get("questions", [])
        framework = data.get("framework", {})

        return GenerateResponse(
            questions=questions,
            framework=Framework(
                business_model=framework.get("business_model", ""),
                risks=framework.get("risks", []),
                growth_drivers=framework.get("growth_drivers", []),
            ),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {e}")


# ---------- Notes: Create ----------
@app.post("/api/notes", response_model=NoteOut)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.name == note.company).first()
    if not company:
        company = Company(name=note.company, ticker=note.ticker)
        db.add(company)
        db.flush()

    db_note = ResearchNote(
        company_id=company.id,
        title=note.title,
        content_md=note.markdown_content,     # user’s typed notes
        sections=note.sections.dict() if note.sections else None,  # Gemini output
        created_by=note.created_by or "anonymous"
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


# ---------- Notes: Update ----------
@app.patch("/api/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(ResearchNote).filter(ResearchNote.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    if payload.title is not None:
        db_note.title = payload.title
    if payload.markdown_content is not None:
        db_note.content_md = payload.markdown_content
    if payload.sections is not None:
        db_note.sections = payload.sections.model_dump()

    db.commit()
    db.refresh(db_note)
    return db_note

# ---------- Notes: Get (list or filter by company) ----------
@app.get("/api/notes", response_model=list[NoteOut])
def list_notes(company: str | None = Query(default=None), db: Session = Depends(get_db)):
    q = db.query(ResearchNote)
    if company:
        q = q.join(Company).filter(Company.name.ilike(f"%{company}%"))
    return q.order_by(ResearchNote.created_at.desc()).all()

# ---------- Notes: Export ----------
@app.post("/api/notes/{note_id}/export", response_model=ExportOut)
def export_note(note_id: int, req: ExportRequest, db: Session = Depends(get_db)):
    note = db.query(ResearchNote).filter(ResearchNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    sections = note.sections or {}
    data = {
        "questions": sections.get("questions", []),
        "framework": {
            "business_model": sections.get("business_model", ""),
            "risks": sections.get("risks", []) or [],
            "growth_drivers": sections.get("growth_drivers", []) or [],
        }
    }
    md = note.content_md or build_markdown(
        company=(note.company.name if note.company else "Unknown"),
        data=data,
        notes=None,
    )

    filename_base = f"note_{note.id}"
    if req.format == "md":
        path = export_markdown(EXPORT_DIR, filename_base, md)
    elif req.format == "docx":
        path = export_docx(EXPORT_DIR, filename_base, note.title, md)
    elif req.format == "pdf":
        path = export_pdf(EXPORT_DIR, filename_base, note.title, md)
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

    public_url = f"/static/{os.path.basename(path)}"
    ex = Export(note_id=note.id, file_url=public_url, format=req.format)
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex
