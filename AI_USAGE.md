# AI Usage Documentation

## AI Tools Used
- **ChatGPT (GPT-4/5)** → For generating research frameworks & coding assistance.
- **Vercel V0** → For Front end UI UX generation.
- **Clause** → For code debugging and storing the files properly

---

## Prompts for Research Generation

**Frontend Generation**
``` bash
Build a web application frontend for equity analysts that has:"A search bar to input a company name/ticker (with autosuggest if available).""A "Generate Research" button that calls an API endpoint /api/ai/generate .""A results panel that displays:"• "List of generated research questions (bullets/numbered list)."• "Structured framework sections: Business Model, Risks, Growth Drivers.""An editable note-taking area where the analyst can add/edit commentary.""Buttons to Save, Export (Markdown, PDF, Docx).""Styling: clean, analyst-friendly (white background, minimal distraction, focus on text)."Use React components (or platform-native Ul blocks). Manage state for company input, API response, andeditor content Integrate API call with async fetch. Ensure responsive design. Include error/loading states. Ifthe platform supports it, auto-save drafts to backend every 30s.
```

**Backend**
```bash
backend/
  ├── app/
  │   ├── main.py          # FastAPI entrypoint
  │   ├── ai.py     
  │   ├── database.py            
  │   ├── schemas.py       
  │   ├── models.py        
  │   ├── exporter.py 
  │   ├── requirements.txt
```
