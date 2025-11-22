# ---------- Frontend build ----------
FROM node:20-slim AS fe
WORKDIR /fe

# install deps (include dev deps explicitly)
COPY frontend/package*.json ./
RUN npm ci --include=dev

# copy source and build using node (avoids "vite: permission denied")
COPY frontend/ ./
RUN node ./node_modules/vite/bin/vite.js build   # outputs to /fe/dist

# ---------- Backend runtime ----------
FROM python:3.14-slim AS api
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# system deps (psycopg, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# app code
COPY backend/ /app/

# bring the built frontend into the backend tree
COPY --from=fe /fe/dist /app/frontend/dist

EXPOSE 8080
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
