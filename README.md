# RentReady starter project

A runnable MVP starter: React + TypeScript + Vite frontend, FastAPI backend, affordability calculator, tenancy document upload with optional Claude analysis, housing support signposting and clearly labelled demo property cards.

## Requirements
Node.js 20+, Python 3.10+.

## Run backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
# Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

Add `ANTHROPIC_API_KEY=your_key` to `backend/.env` to enable AI tenancy explanations. Keep keys out of frontend code and Git.

## Run frontend (second terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the Vite URL, normally http://localhost:5173.

## Important limitations
Property cards are demo data, not live listings. Housing support is signposting, not an eligibility decision. AI tenancy explanations are not legal advice. Before public launch add authentication, persistent database, rate limiting, malware scanning, secure document handling/deletion, privacy notices, accessibility/security testing and monitored official housing rules for each UK nation.
