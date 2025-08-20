import json
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_research(company: str, ticker: str | None = None, sector: str | None = None, country: str | None = None):
    prompt = f"""
        You are an expert equity research assistant with deep knowledge of financial analysis, corporate strategy, and market dynamics.

        Generate **structured research data** for the company {company} ({ticker or "N/A"}) in **JSON ONLY**. The JSON must strictly follow this schema:

        {{
        "questions": [ "string", "string", "string" ],
        "framework": {{
            "business_model": "string",
            "risks": [ "string", "string" ],
            "growth_drivers": [ "string", "string" ]
        }}
        }}

        Requirements:
        1. **Research Questions**: Provide 5–7 thought-provoking and insightful questions that an analyst might ask when evaluating this company. They should cover strategy, competitive positioning, market opportunities, and potential challenges.
        2. **Business Model**: Provide a concise but informative explanation of the company's business model, including revenue streams, key customers, value proposition, and competitive advantages.
        3. **Risks**: List 3–5 major risks facing the company. Include financial, operational, regulatory, and market risks. Each risk should be actionable or analyzable.
        4. **Growth Drivers**: List 3–5 drivers that could contribute to future growth, such as market trends, product innovation, geographic expansion, or partnerships.
        5. Avoid vague terms. Be specific and practical.
        6. Format the JSON cleanly with arrays of strings. Do not include extra commentary outside the JSON.

        Example output:

        {{
        "questions": [
            "How will the company expand its presence in emerging markets?",
            "What are the key risks of its supply chain?",
            "How sustainable is its revenue model in the next 5 years?"
        ],
        "framework": {{
            "business_model": "Company X generates revenue primarily through subscription services, targeting SMEs and enterprise clients, leveraging its proprietary SaaS platform.",
            "risks": [
            "Dependence on a single product line",
            "Potential regulatory changes in key markets"
            ],
            "growth_drivers": [
            "Expansion into international markets",
            "Introduction of AI-driven features to the platform"
            ]
        }}
        }}
        """



    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    text = response.text.strip()

    # Try to parse JSON
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Try to recover if Gemini adds extra formatting
        fixed = text[text.find("{"): text.rfind("}")+1]
        try:
            data = json.loads(fixed)
        except Exception as e:
            raise RuntimeError(f"Failed to parse AI JSON: {e}\nRaw:\n{text}")

    return data
