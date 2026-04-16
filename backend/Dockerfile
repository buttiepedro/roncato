FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema para psycopg2 (Postgres)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3001

CMD ["python", "main.py"]