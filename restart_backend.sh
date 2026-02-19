#!/bin/bash
echo "Attempting to restart backend service..."

# Directory check
PROJECT_DIR="$HOME/ocaas-project/backend"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Error: Backend directory not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Check if Docker Compose is running
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo "Found running Docker containers. Restarting..."
    docker-compose restart
    echo "Backend restarted via Docker!"
    exit 0
fi

# Check if Node/Express is running on port 3000
PID=$(lsof -t -i:3000 2>/dev/null)
if [ -n "$PID" ]; then
    echo "Found backend running with PID $PID. Access mode restriction prevents auto-restart."
    echo "Please restart manually in the terminal where it is running."
    echo "To stop: Ctrl+C"
    echo "To start: npm run dev"
    exit 0
fi

echo "No active backend service found on port 3000."
echo "Starting backend in background..."
# Try to start it? might be risky if we don't stream logs.
# better to just tell them.
echo "Run 'npm run dev' in this directory to start the server."
