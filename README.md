# Support Coach MVP

This project is a Support Coach tool built with FastAPI and React/Vite, contained and orchestrated using Docker and Docker Compose.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Riot Games API key

## Setup Instructions
1. Provide your Riot Games API key in `backend/.env`.
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add RIOT_API_KEY=your_key
   ```
2. Run the application suite via Docker Compose form the root directory:
   ```bash
   docker-compose up --build
   ```
   This will simultaneously spin up:
   - **Frontend (React/Vite)** at `http://localhost:5173`
   - **Backend (FastAPI)** at `http://localhost:8000` (Swagger interactive docs at `http://localhost:8000/docs`)
   - **Database (PostgreSQL)** exposed on port `5432` Locally

## Development Commands
- **Rebuild Containers:** 
  ```bash
  docker-compose build
  ```
- **Tear down environment:** 
  ```bash
  docker-compose down -v
  ``` 
  *(Omit `-v` if you do not want to destroy database volumes)*
  
- **Run Migrations (inside backend container):** 
  ```bash
  docker-compose exec backend alembic upgrade head
  ```
- **Linting & Formatting:** 
  We use `pre-commit`, `ruff`, `black`, and `isort`. You can execute them across the codebase natively:
  ```bash
  docker-compose exec backend pre-commit run --all-files
  ```
- **Compile Backend Dependencies Deterministically:** 
  ```bash
  docker-compose exec backend pip-compile requirements.in
  ```
- **Frontend Commands:** 
  ```bash
  docker-compose exec frontend npm run lint
  docker-compose exec frontend npm run format
  ```
