#!/bin/bash

# AI Personal Stylist - Startup Script
# =====================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════╗"
echo "║       AI Personal Stylist                ║"
echo "║       Starting Application...            ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found!${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Function to kill processes on a port
kill_port() {
  local port=$1
  local pids=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}  Killing processes on port $port...${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

# Clean up used ports
echo -e "\n${CYAN}[1/6] Cleaning up ports...${NC}"
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
echo -e "${GREEN}✓ Ports $BACKEND_PORT and $FRONTEND_PORT are free${NC}"

# Check PostgreSQL
echo -e "\n${CYAN}[2/6] Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -q 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
  fi
else
  echo -e "${YELLOW}  pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# Create database and user if needed
echo -e "\n${CYAN}[3/6] Setting up database...${NC}"
psql postgres -c "CREATE USER stylist_user WITH PASSWORD 'stylist_pass';" 2>/dev/null || true
psql postgres -c "ALTER USER stylist_user CREATEDB;" 2>/dev/null || true
psql postgres -c "CREATE DATABASE ai_stylist OWNER stylist_user;" 2>/dev/null || true
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE ai_stylist TO stylist_user;" 2>/dev/null || true
echo -e "${GREEN}✓ Database ready${NC}"

# Install backend dependencies
echo -e "\n${CYAN}[4/6] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Seed database
echo -e "\n${CYAN}[5/6] Seeding database...${NC}"
node seed.js
echo -e "${GREEN}✓ Database seeded${NC}"

# Install frontend dependencies
echo -e "\n${CYAN}[6/6] Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill_port $BACKEND_PORT
  kill_port $FRONTEND_PORT
  echo -e "${GREEN}✓ All processes stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend with hot reload
echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Starting servers with hot reload...${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with hot reload (Vite HMR)
cd "$PROJECT_DIR/frontend"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!

echo -e "\n${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Application is running!                 ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  Frontend: http://localhost:$FRONTEND_PORT          ║${NC}"
echo -e "${GREEN}║  Backend:  http://localhost:$BACKEND_PORT          ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  Login: demo@stylist.com / demo123       ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"

wait
