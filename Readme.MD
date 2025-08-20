# AI-Powered Research Assistant

## Overview
This project is an AI-powered equity research tool that enables analysts to quickly analyze companies.  
It generates research questions, provides a structured framework (business model, risks, growth drivers), allows analysts to take notes, and export reports as PDFs.

---

## Features
- Search by company name or ticker
- AI-generated research questions
- Structured analysis framework
- Save and retrieve research templates
- Analyst notes
- Export research to **multi-page PDFs**

---

## Tech Stack
- **Frontend:** React + TypeScript (Next.js)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **AI Integration:** OpenAI GPT
- **PDF Export:** jsPDF
- **State Management:** React Hooks

---

## Prerequisites
- **Node.js** ≥ 18.x  
  [Download & Install Node.js](https://nodejs.org/)  

- **Python** ≥ 3.10  
  [Download & Install Python](https://www.python.org/downloads/)  

- **PostgreSQL** ≥ 14  
  [Download & Install PostgreSQL](https://www.postgresql.org/download/)  

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your_repo_url>
cd researcher
```

---

## Database Setup

### 1. Start PostgreSQL Service
Make sure PostgreSQL is running.

### 2. Open `psql`
```bash
psql -U postgres
```

### Create Database
```bash
CREATE DATABASE research;
```

### Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate   # macOS/Linux

venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### .env
- GEMINI_API_KEY="Your_key"
#### Postgres (examples)
##### Database connection

DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/researchdb


#### CORS (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.34:3000



### Running backend
```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000