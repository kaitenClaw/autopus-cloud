FROM node:22-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    py3-pip \
    curl \
    bash

# Install clawhub CLI globally
RUN npm install -g clawhub

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy source
COPY src/ ./src/

# Create workspace and skills directories
RUN mkdir -p /app/workspace/memory /app/skills /app/logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["node", "src/index.js"]
