FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install OpenClaw globally
RUN npm install -g openclaw@latest

# Set up workspace
WORKDIR /workspace

# Set default envs
ENV OPENCLAW_HOME=/workspace/.openclaw

EXPOSE 18789-18800

ENTRYPOINT ["openclaw"]
CMD ["gateway", "start"]
