# backend/Dockerfile
FROM python:3.12.6-slim

# 1. Set working directory
WORKDIR /app

# 2. Install system deps (if you need build tools, e.g. for psycopg2)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# 3. Copy only requirements.lock and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy application code
COPY . /app

# 5. Set environment variables
ENV PORT=8000

# 6. Expose the port
EXPOSE ${PORT}

# 7. Run the application with gunicorn
CMD gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT}

# 5. Expose port and default command
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
