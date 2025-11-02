# backend/Dockerfile
FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# deps
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# app code (includes app/, alembic.ini, etc.)
COPY . /app

# default; Cloud Run will override port with $PORT
CMD ["python","-m","uvicorn","app.main:app","--host","0.0.0.0","--port","8080"]

