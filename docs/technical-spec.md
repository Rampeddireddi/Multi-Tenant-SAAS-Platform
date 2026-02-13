Technical Specification
1. Project Structure

The project follows a monorepo-style structure.

The root directory manages container orchestration

Backend and frontend are isolated applications

1.1 Root Directory
multi-tenant-saas/
├── docker-compose.yml      # Orchestrates Backend, Frontend, and DB containers
├── README.md               # Project entry point and documentation index
├── docs/                   # Documentation (Architecture, Research, PRD)
├── backend/                # Node.js API Application
└── frontend/               # React.js SPA Application

1.2 Backend Structure (/backend)

Architecture: MVC (Controller – Service – Data)
Runtime: Node.js + Express

### The backend handles

Authentication & authorization (JWT + RBAC)

Tenant isolation

Business logic

Database access and auditing

Backend Directory Layout
backend/
├── src/
│   ├── controllers/        # Request handlers (Auth, Projects, Tasks)
│   ├── routes/             # API route definitions
│   ├── middleware/         # JWT auth & role-based access control
│   ├── utils/              # Helpers (DB, Logger, Validators)
│   └── app.js              # Application entry point
├── database/
│   ├── migrations/         # SQL schema migrations
│   └── seeds/              # Initial data population
├── .env                    # Environment variables
├── Dockerfile              # Node.js container build file
└── package.json            # Dependencies and scripts

Backend Folder Responsibilities
controllers/

Handles HTTP requests

Validates input

Executes business logic

Returns JSON responses

routes/

Defines REST endpoints

Example: POST /api/auth/login

middleware/

protect → JWT validation

authorize → Role-based access control

database/migrations/

SQL files such as 001_init.sql

Executed automatically at startup

Ensures schema consistency

1.3 Frontend Structure (/frontend)

Framework: React
Architecture: SPA using Hooks
Styling: Tailwind CSS

Frontend Directory Layout
frontend/
├── public/
│   └── index.html           # Root HTML file
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-based views
│   ├── services/            # Axios API layer
│   ├── App.js               # Routing configuration
│   └── index.css            # Global styles
├── .env                     # Environment variables
├── Dockerfile               # React container build file
├── package.json             # Dependencies
└── tailwind.config.js       # Tailwind configuration

Frontend Folder Responsibilities
pages/

Route-level views

### Examples

Login

Dashboard

ProjectDetails

components/

Reusable UI elements

Layout and modal components

Layout.js provides sidebar & header

services/

Centralized API communication

Axios auto-attaches
Authorization: Bearer <token>

2. Development Setup Guide
2.1 Prerequisites

Docker Desktop (20.10+)

Git

Node.js 16+ (optional)

2.2 Environment Variables
Backend (backend/.env)
PORT=5000
DATABASE_URL=postgres://user:password@database:5432/saas_db
JWT_SECRET=supersecretkey_dev_only
FRONTEND_URL=http://frontend:3000

Frontend (frontend/.env)
REACT_APP_API_URL=http://localhost:5000/api

2.3 Installation & Execution
Clone Repository
git clone <repository_url>
cd multi-tenant-saas

One-Command Deployment
docker-compose up -d --build


### This will

Build backend and frontend images

Start PostgreSQL

Run migrations

Seed initial data

Access URLs

Frontend: http://localhost:3000

Backend API: http://localhost:5000

Health Check: http://localhost:5000/api/health

2.4 Manual Testing
Health Check
GET /api/health


### Response

{ "status": "ok" }

Authentication

Register tenant

Login

Redirect to dashboard

Audit Logs

Delete a project

Verify entry in audit_logs

2.5 Local Development (Without Docker)
Backend
cd backend
npm install
npm start


Ensure PostgreSQL is running locally.

Frontend
cd frontend
npm install
npm start