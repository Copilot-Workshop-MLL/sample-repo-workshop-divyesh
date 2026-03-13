# Employee Management System

This repository now contains a full-stack Employee Management System scaffold built from the project plan in [architecture.md](architecture.md) and [plan.md](plan.md).

## Stack

- Backend: Node.js + Express
- Frontend: React + react-hook-form
- Authentication: JWT-based login/logout
- Persistence: PostgreSQL-ready with an in-memory development fallback
- Testing: Jest, Supertest, and React Testing Library

## Features

- Employee CRUD for ID, name, email, department, role, hire date, and salary
- Search and filtering by department, role, and free-text search
- Dashboard statistics for total employees, average salary, department mix, and role coverage
- Basic authentication with a seeded demo user for local development
- Responsive UI for desktop and mobile
- Input validation and JSON error handling on the API

## Project Structure

```text
.
├── architecture.md
├── backend
│   ├── app.js
│   ├── config
│   ├── controllers
│   ├── data
│   ├── db
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── tests
├── frontend
│   ├── public
│   └── src
├── plan.md
└── package.json
```

## Quick Start

1. Copy the environment examples.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Install dependencies.

```bash
npm --prefix backend install
npm --prefix frontend install
```

3. Start the backend.

```bash
npm run dev:backend
```

4. Start the frontend in a second terminal.

```bash
npm run dev:frontend
```

The backend defaults to in-memory storage so the app runs immediately without PostgreSQL. To use PostgreSQL, set `DATABASE_URL` in `backend/.env`, set `USE_MEMORY_DB=false`, and run the schema in `backend/db/schema.sql`.

## Demo Credentials

- Email: `admin@example.com`
- Password: `admin123`

## Root Scripts

- `npm run dev:backend` starts the Express API.
- `npm run dev:frontend` starts the React development server.
- `npm run test:backend` runs the API tests.
- `npm run test:frontend` runs the frontend smoke test.
- `npm run build:frontend` creates the production frontend build.
- `npm test` runs both backend and frontend test suites.

## API Surface

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/dashboard/stats`
- `GET /api/health`

## Verification

The backend test suite passes, the frontend test suite passes, the frontend production build succeeds, and the backend health endpoint responds on `http://127.0.0.1:5000/api/health`.