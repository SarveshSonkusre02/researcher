# Test Plan - AI-Powered Stock Research Assistant

## 1. Objectives
Ensure that:
- The system works end-to-end (UI → API → DB → PDF).
- AI-generated data follows the required schema.
- Notes and exports function reliably.

---

## 2. Types of Testing

### A. Unit Testing
**Frontend (React):**
- Input box updates state
- Notes are added/edited correctly
- PDF export handles multi-page

**Backend (FastAPI):**
- `/generate_research` returns valid schema
- `/api/notes` correctly saves and retrieves data
- DB connection & error handling tested

---

### B. Integration Testing
- Frontend calls backend and displays AI response
- Backend stores/retrieves research correctly
- Frontend renders DB results as expected

---

### C. End-to-End (E2E)
Scenarios tested:
1. User searches valid company → research generated → saved → PDF exported
2. Invalid company input → graceful error message
3. Long analyst notes → PDF spans multiple pages
4. Multiple searches without reload → previous state cleared
5. Save + retrieve workflow

---

### D. Performance Testing
- Concurrent requests to backend
- AI API response time under load
- DB query latency

---

### E. Edge Cases
- Empty company input
- AI response malformed (simulate failure)
- Special characters in notes
- Very long notes (multi-page PDF check)

---
