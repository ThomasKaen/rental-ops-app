FROM python:3.14-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# system build deps if you need them (optional)
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# install deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ⬇️ copy the ENTIRE backend folder (so alembic.ini + alembic/ come in)
COPY . .

# optional, helps imports like "import app.models"
ENV PYTHONPATH=/app
