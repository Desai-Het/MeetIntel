# Use a slim Python 3.11 base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (build-essential for some pip packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy local projects requirements first for layer caching
COPY requirements.txt .

# Install all dependencies from PyPI
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the Flask port
EXPOSE 5001

# Set production environment variables
ENV FLASK_APP=MeetIntel_app.py
ENV PYTHONUNBUFFERED=1

# Use Gunicorn as the production-ready server
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "MeetIntel_app:app"]
