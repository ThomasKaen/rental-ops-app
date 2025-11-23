# syntax=docker/dockerfile:1

FROM python:3.14-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Ensure SQLite dir exists
RUN mkdir -p /app/data

# Cloud Run port
ENV PORT=8080
EXPOSE 8080

# Run uvicorn, listening on $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
