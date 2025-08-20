from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False, index=True, unique=True)
    ticker: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    sector: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # backref to research notes
    notes: Mapped[list["ResearchNote"]] = relationship("ResearchNote", back_populates="company")


class ResearchTemplate(Base):
    __tablename__ = "research_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sections: Mapped[dict] = mapped_column(
        JSON, nullable=False
    )  # e.g. {"sections":["business_model","risks","growth_drivers"]}
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ResearchNote(Base):
    __tablename__ = "research_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id"), nullable=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content_md: Mapped[str | None] = mapped_column(Text, nullable=True)  # user-written notes in markdown
    sections: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )  # AI generated {"questions": [...], "business_model": str, "risks":[...], "growth_drivers":[...]}
    created_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # backref to company
    company: Mapped["Company"] = relationship("Company", back_populates="notes")

    # backref to exports
    exports: Mapped[list["Export"]] = relationship("Export", back_populates="note")


class Export(Base):
    __tablename__ = "exports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    note_id: Mapped[int] = mapped_column(Integer, ForeignKey("research_notes.id"))
    file_url: Mapped[str] = mapped_column(String, nullable=False)
    format: Mapped[str] = mapped_column(String, nullable=False)  # pdf | docx | md
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # backref to research note
    note: Mapped["ResearchNote"] = relationship("ResearchNote", back_populates="exports")
