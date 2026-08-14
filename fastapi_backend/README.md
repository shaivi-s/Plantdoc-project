# PlantDoc FastAPI Backend

REST API for the Plant Disease Detection app (matches the report: FastAPI + PostgreSQL).
Handles user registration, login (JWT), and disease/medicine data.

## Setup

1. Make sure PostgreSQL is running and the database "plantdoc_db" exists.

2. Create a virtual environment:
   python -m venv venv
   venv\Scripts\activate        (Windows)

3. Install dependencies:
   pip install -r requirements.txt

4. Copy .env.example to .env and put your real postgres password in DATABASE_URL.

5. Start the server:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

6. Open http://localhost:8000/docs in a browser.
   This is the automatic API documentation - you can test every endpoint here!

## Endpoints
- POST /api/auth/register   - create account, returns token
- POST /api/auth/login      - login, returns token
- GET  /api/auth/me         - current user (needs token)
- GET  /api/diseases        - list diseases
- GET  /api/medicines       - list medicines

## Tables
Tables are created automatically when you start the server the first time.
