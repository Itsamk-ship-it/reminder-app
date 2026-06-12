# Combined image for the Nexlayer `app` pod: builds the Next.js frontend and
# serves it alongside the FastAPI backend in a single container.
#   - Frontend (Next.js) listens on :3000  -> public port (servicePorts in nexlayer.yaml)
#   - Backend  (FastAPI) listens on :8000  -> internal only
# The frontend proxies /api/* to the backend via BACKEND_POD_URL (see frontend/next.config.js).

# ---- Stage 1: build the Next.js frontend (standalone output) ----
FROM mirror.gcr.io/library/node:20-alpine AS frontend-builder
WORKDIR /frontend

# Install deps first to maximise layer-cache hits
COPY frontend/package*.json ./
RUN npm ci

# Build the app (next.config.js sets output: 'standalone')
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: combined runtime (Python backend + Node frontend) ----
FROM mirror.gcr.io/library/python:3.11-slim
WORKDIR /app

# Node.js is needed to run the Next.js standalone server; build-essential/libpq
# are needed to install psycopg2 and connect to Postgres.
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl ca-certificates gnupg build-essential libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies (cached unless requirements.txt changes)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy the built Next.js standalone server + static assets
COPY --from=frontend-builder /frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /frontend/.next/static ./frontend/.next/static

# Start both processes: backend in the background, frontend in the foreground.
RUN printf '%s\n' \
    '#!/bin/sh' \
    'set -e' \
    'cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &' \
    'cd /app/frontend && exec node server.js' \
    > /app/start.sh && chmod +x /app/start.sh

# Frontend runtime config
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    BACKEND_POD_URL=http://localhost:8000

EXPOSE 3000
CMD ["/bin/sh", "/app/start.sh"]
