# ScopeGuard AI

ScopeGuard AI is a Next.js app for uploading scope documents (PDF, DOCX, TXT), extracting text, and generating project analysis outputs for delivery teams.

## Sprint 5 Highlights

- Added AI-powered scope analysis via a secure backend route: `POST /api/analyze-ai`.
- Uses OpenAI API with server-side `OPENAI_API_KEY`.
- Added **Run AI Analysis** action on `/upload`.
- Keeps Sprint 4 rule-based analysis and exports as graceful fallback if AI is unavailable.

## Environment Setup

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

> The API key is only read on the server in route handlers. Do not expose it in client-side code.

## Getting Started

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/upload](http://localhost:3000/upload).

## Scripts

```bash
npm run lint
npm run build
npm run start
```

## Supported Upload Formats

- PDF (`.pdf`)
- Microsoft Word (`.docx`)
- Plain text (`.txt`)

Max file size: 10 MB per file.

## API Routes

- `POST /api/upload` — ingest documents, persist uploads, extract text.
- `POST /api/analyze-ai` — analyze extracted text with OpenAI and return structured JSON:

```json
{
  "executive_summary": "...",
  "functional_requirements": ["..."],
  "non_functional_requirements": ["..."],
  "risks": ["..."],
  "dependencies": ["..."],
  "ambiguities": ["..."],
  "missing_information": ["..."],
  "client_questions": ["..."],
  "suggested_next_steps": ["..."],
  "complexity": "Low"
}
```
