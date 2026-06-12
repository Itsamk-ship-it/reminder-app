# Nexlayer — reminder-app

<!-- nexlayer:meta version=1 analyzed=2026-06-12T12:26:31Z repo=https://github.com/Itsamk-ship-it/reminder-app branch=main -->

> **For AI agents (Claude Code, Cursor, Gemini CLI, Copilot):**
> This file is the **project context** for this Nexlayer deployment — tech stack, env vars, secrets, live URL.
> For full platform detail (nexlayer.yaml schema, Dockerfile rules, CI/CD, task recipes) read **`nexlayer.skills`** in this repo.
>
> **Critical rules (full detail in `nexlayer.skills`):**
> - Inter-pod refs: `${podName:port}` only — never `localhost` or bare hostnames
> - Docker Hub images: prefix with `mirror.gcr.io/library/` — bare tags fail on the cluster
> - Secrets: set in the Nexlayer dashboard — never commit to `nexlayer.yaml` or Dockerfile
>
> **This file:** `agent-managed` sections update automatically. `user-editable` sections (Local Development Setup, Nexlayer Deployment Plan, Build Notes) are yours — preserved across re-analysis.

## Project Summary
<!-- nexlayer:section agent-managed=project_summary -->
A full-stack reminder application that leverages FastAPI and Next.js to schedule automated voice call reminders via Vapi AI.
<!-- nexlayer:end -->

## Technology Stack
<!-- nexlayer:section agent-managed=tech_stack -->
| Name | Kind | Version | Detected From |
|------|------|---------|---------------|
| Next.js | framework | 14 | README.md |
| FastAPI | framework | 0.109 | README.md |
| Python | language | 3.13 | README.md |
| TypeScript | language | 5.4 | README.md |
| Tailwind CSS | framework | 3.4 | README.md |
| SQLAlchemy | tool | unknown | README.md |
<!-- nexlayer:end -->

## Repository Structure
<!-- nexlayer:section agent-managed=structure_map -->
- backend/app/ — FastAPI application logic, routers, and SQLAlchemy models
- frontend/ — Next.js frontend with Tailwind CSS and Framer Motion
<!-- nexlayer:end -->

## External Services Required
<!-- nexlayer:section agent-managed=external_deps -->
Services that must be configured separately (not deployed by Nexlayer):

- Vapi AI API (Voice call integration)
<!-- nexlayer:end -->

## Local Development Setup
<!-- nexlayer:section user-editable=local_setup -->
### Prerequisites

- Node.js >= 18
- Python >= 3.13
- PostgreSQL

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL=postgresql://user:password@localhost:5432/reminder_db
VAPI_API_KEY=your_vapi_key
```

### Steps

1. `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload` — Start FastAPI backend
2. `cd frontend && npm install && npm run dev` — Start Next.js frontend on http://localhost:3000

<!-- nexlayer:end -->

## Nexlayer Setup
<!-- nexlayer:section agent-managed=nexlayer_setup -->
### Pod Environment Variables

| Pod | Variable | Value | Kind |
|-----|----------|-------|------|
| `app` | `PORT` | `"8000"` | plain |
| `app` | `VAPI_API_KEY` | _(set via Nexlayer dashboard)_ | secret |
| `app` | `VAPI_PHONE_NUMBER_ID` | `""` | plain |
| `app` | `TWILIO_ACCOUNT_SID` | `""` | plain |
| `app` | `TWILIO_AUTH_TOKEN` | _(set via Nexlayer dashboard)_ | secret |
| `app` | `TWILIO_PHONE_NUMBER` | `""` | plain |

### Secrets Required

Set these in the Nexlayer dashboard before deploying:

- `VAPI_API_KEY` (`app` pod)
- `TWILIO_AUTH_TOKEN` (`app` pod)

### nexlayer.yaml

```yaml
application:
  name: swift-nova-reminder-app
  pods:
    - name: app
      image: "# filled by pipeline"
      path: /
      servicePorts:
        - 8000
      vars:
        PORT: "8000"
        VAPI_API_KEY: ""
        VAPI_PHONE_NUMBER_ID: ""
        TWILIO_ACCOUNT_SID: ""
        TWILIO_AUTH_TOKEN: ""
        TWILIO_PHONE_NUMBER: ""
```

<!-- nexlayer:end -->

## Nexlayer Deployment Plan
<!-- nexlayer:section user-editable=deployment_plan -->
### Pod Topology

| Pod | Image | Port | Role |
|-----|-------|------|------|
| db | mirror.gcr.io/library/postgres:16-alpine | 5432 | database |
| backend | mirror.gcr.io/library/python:3.13-slim | 8000 | web |
| frontend | mirror.gcr.io/library/node:20-alpine | 3000 | web |

### Inter-pod environment variables

- `backend` pod: `DATABASE_URL=postgresql://postgres:password@${db:5432}/reminders`
- `frontend` pod: `NEXT_PUBLIC_API_URL=http://${backend:8000}`

### Deployment notes

- The backend pod connects to the database using ${db:5432}.
- The frontend pod connects to the backend using ${backend:8000}.
- Each component is isolated in its own pod per Nexlayer rules.

<!-- nexlayer:end -->

## Build Notes
<!-- nexlayer:section user-editable=build_notes -->
<!-- Add notes for future builds here — preserved across re-analysis -->
<!-- nexlayer:end -->

## Nexlayer Configuration
<!-- nexlayer:section agent-managed=nexlayer_config -->
**Last deployed:** 2026-06-12T12:33:59Z  
**Live URL:** https://vibrant-wasp-swift-nova-reminder-app.cloud.nexlayer.ai  
**Runtime:** docs · **Port:** 8000  
**Deploy branch:** main  

```yaml
application:
  name: swift-nova-reminder-app
  pods:
    - name: app
      image: "# filled by pipeline"
      path: /
      servicePorts:
        - 8000
      vars:
        PORT: "8000"
        VAPI_API_KEY: ""
        VAPI_PHONE_NUMBER_ID: ""
        TWILIO_ACCOUNT_SID: ""
        TWILIO_AUTH_TOKEN: ""
        TWILIO_PHONE_NUMBER: ""
```
<!-- nexlayer:end -->

## Build History
<!-- nexlayer:section agent-managed=build_history -->
| Date | Status | Notes |
|------|--------|-------|
| 2026-06-12T12:26:31Z | analyzed | initial repo analysis |
| 2026-06-12T12:33:59Z | success | deployed https://vibrant-wasp-swift-nova-reminder-app.cloud.nexlayer.ai |
<!-- nexlayer:end -->
