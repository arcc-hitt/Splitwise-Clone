#!/bin/bash
set -e

# Wait for the database to be ready (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    echo "Waiting for database to be ready..."
    python << END
import sys
import time
import psycopg2
import os

db_url = os.getenv("DATABASE_URL")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

for _ in range(30):
    try:
        psycopg2.connect(db_url)
        print("Database is ready!")
        sys.exit(0)
    except psycopg2.OperationalError:
        print("Waiting for database...")
        time.sleep(1)
print("Could not connect to database")
sys.exit(1)
END
fi

# Start the application
exec gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
