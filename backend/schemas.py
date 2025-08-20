from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# -------- AI Generate --------
class GenerateRequest(BaseModel):
    company: str
    ticker: Optional[str] = None
    sector: Optional[str] = None
    country: Optional[str] = None

class Framework(BaseModel):
    business_model: str
    risks: List[str]
    growth_drivers: List[str]

class GenerateResponse(BaseModel):
    questions: List[str]
    framework: Framework

# -------- Notes I/O --------
class Sections(BaseModel):
    business_model: Optional[str] = None
    risks: Optional[List[str]] = None
    growth_drivers: Optional[List[str]] = None

class NoteCreate(BaseModel):
    company: str
    ticker: Optional[str] = None
    title: str
    markdown_content: Optional[str] = None
    sections: Optional[Sections] = None
    created_by: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    markdown_content: Optional[str] = None
    sections: Optional[Sections] = None

class NoteOut(BaseModel):
    id: int
    company_id: int | None
    title: str
    content_md: str | None
    sections: Dict[str, Any] | None
    created_by: str | None

    class Config:
        from_attributes = True

class ExportRequest(BaseModel):
    format: str = Field(pattern="^(pdf|docx|md)$")

class ExportOut(BaseModel):
    id: int
    file_url: str
    format: str

    class Config:
        from_attributes = True
