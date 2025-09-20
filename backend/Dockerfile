FROM python:3.13-slim
RUN pip install poetry==1.8.3
WORKDIR /app
COPY pyproject.toml /app/
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi
COPY app /app/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]