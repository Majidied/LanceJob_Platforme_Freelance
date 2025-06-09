# Use the official Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for logs and data
RUN mkdir -p /app/logs /app/data

# Expose port
EXPOSE 2511

# Set environment variables
ENV PYTHONPATH=/app
ENV FLASK_APP=api_server.py
ENV FLASK_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:2511/api/health || exit 1

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:2511", "--workers", "4", "--timeout", "120", "api_server:app"]
