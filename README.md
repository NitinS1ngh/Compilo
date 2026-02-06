# Compilo

A simple code editor with an AI review panel. The frontend provides a code editor and output pane, while the backend compiles/runs code via JDoodle and sends code to Google Generative AI for short reviews.


## Features
- Run code in multiple languages (C, C++, Java, Python, JavaScript, Go, C#, PHP, Ruby, Kotlin, Swift, Rust)
- Provide stdin input
- AI review with short feedback and optional corrected code
- One-click replace of editor code when a fix is provided

## Tech Stack
- Frontend: Vite + React + Tailwind CSS
- Backend: Node.js + Express
- Code execution: JDoodle API
- AI: Google Generative AI

## Project Structure
- backend/ - Express API
- frontend/ - React app

## Setup

### 1) Clone

```bash
git clone https://github.com/NitinS1ngh/Compilo.git
cd Compilo
```

### 2) Backend

```bash
cd backend
npm install
```

Create a .env file in backend/ (or update the existing one):

```dotenv
PORT=3000
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
GEMINI_API_KEY=your_gemini_api_key
# Optional: if omitted, the backend attempts to pick a supported model
GEMINI_MODEL=
```

Start the backend:

```bash
npm start
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the app at the URL shown by Vite (usually http://localhost:5173).

## API Endpoints
- POST /compile
  - Body: { code, input, language }
- POST /ask-ai
  - Body: { code, language, model? }
  - Returns structured JSON with correctness and optional corrected code

## Notes
- If you want a specific model, pass it in the request body or set GEMINI_MODEL in backend/.env.
- If the model is not supported by the API, the backend will try to select a compatible one.


