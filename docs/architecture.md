# Saralam — Architecture

> High-level architecture and design decisions. To be expanded.

## Environment configuration

- **Single .env at runtime:** Locally you copy the right env file (`cp backend/.env.develop backend/.env`). In CI/CD, the pipeline copies `.env.<environment>` to `.env` from the branch (develop → develop, qa → qa, main → prod), then overlays secret values from GitHub Secrets.
- **Backend:** `backend/app/core/config.py` loads `.env` via pydantic-settings; use `get_settings()` or `settings`.
- **Frontend:** Each app has `.env.develop`, `.env.qa`, `.env.prod`; Vite embeds `VITE_*` at build time. Typed access via `src/config/env.ts` → `appConfig`.
- **Secrets:** See [docs/secrets.md](secrets.md) for the GitHub Secrets naming convention.

## Overview

Saralam is a service marketplace platform connecting service seekers with providers (event, marketing, transport, lifestyle).

## Repo Layout

- **backend/** — FastAPI + Python 3.12, MS SQL Server, JWT + Google OAuth, Razorpay
- **saralam_webapp/** — React 18 + Vite (customers + service providers)
- **saralam_admin/** — React 18 + Vite (admin dashboard)
- **shared/** — Shared types, constants, utilities

## Tech Stack Summary

| Layer    | Stack |
| -------- | ----- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v4, React Router v7, TanStack Query v5, Zustand, React Hook Form, Zod |
| Backend  | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, JWT (python-jose), passlib, httpx, python-dotenv |
| Database | MS SQL Server (pyodbc, aioodbc) |
| Auth     | JWT (backend), Google OAuth 2.0 (webapp) |
| Payments | Razorpay (subscription management) |
