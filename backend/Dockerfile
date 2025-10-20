# syntax=docker/dockerfile:1.7

FROM python:3.14-slim AS build
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 LANG=C.UTF-8 LC_ALL=C.UTF-8 TZ=UTC PIP_ONLY_BINARY=:all:
WORKDIR /app

# ⬇️ add compiler toolchain only in build stage
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --upgrade pip setuptools wheel
COPY requirements.txt /app/requirements.txt
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt

FROM python:3.14-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 LANG=C.UTF-8 LC_ALL=C.UTF-8 TZ=UTC PIP_ONLY_BINARY=:all:
WORKDIR /app
RUN useradd -u 10001 -m appuser
COPY --from=build /app/wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY app /app/app
USER appuser
EXPOSE 8000
ENV UVICORN_WORKERS=1
CMD ["bash","-lc","uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${UVICORN_WORKERS}"]
