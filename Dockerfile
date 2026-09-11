# ====================================================================
# Dockerfile for Cheatz Dabber AI Voice Clone & Dubbing Studio
# ====================================================================

FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

# Install system packages (FFmpeg is mandatory for audio/video processing)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Ensure storage directories exist
RUN mkdir -p uploads outputs samples data scratch

# Expose port (Render will set PORT environment variable dynamically)
EXPOSE 3000

# Start server respecting dynamic $PORT from cloud platforms like Render
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-3000}"]
