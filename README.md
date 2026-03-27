# UNTITLED

## Stack
- **Backend**: FastAPI
- **Database**: Supabase
- **LLM**: Gemini (Google AI Studio) - Handles both structuring and generation.
- **Speech**: Sarvam AI (Indian languages STT)
- **Delivery**: Twilio (WhatsApp)

## How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd build-it-on-boilerplate
   ```

2. **Set up virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Add environment variables**:
   Create a `.env` file in the `backend/` directory (or root, depending on your setup) and add the following:
   ```env
   SARVAM_API_KEY=your_sarvam_key
   GEMINI_API_KEY=your_gemini_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   ```

5. **Run the server**:
   ```bash
   uvicorn backend.main:app --reload
   ```

## Folder Structure
- `backend/`: Contains the FastAPI application logic.
  - `routers/`: API endpoints.
  - `services/`: External API integrations (Gemini, Sarvam, Twilio).
  - `models/`: Pydantic and database schemas.
- `UNTITLED_Playbook_v2.md`: Detailed hackathon strategy and roles.
- `.ai-context`: Project-wide context for AI coding assistants.
