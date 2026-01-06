#!/bin/bash

echo "🚀 Starting Speech Recognition HCI Lab..."
echo ""

# Colors
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Start Backend
echo -e "${CYAN}Starting FastAPI Backend...${NC}"
source venv/bin/activate
cd backend
python main.py &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to start
sleep 3

# Start Frontend
echo -e "${MAGENTA}Starting React Frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""
echo "======================================"
echo -e "${CYAN}🎤 Speech Recognition Lab is running!${NC}"
echo "======================================"
echo ""
echo -e "Backend API: ${CYAN}http://localhost:8000${NC}"
echo -e "Frontend UI: ${MAGENTA}http://localhost:5173${NC}"
echo -e "API Docs: ${CYAN}http://localhost:8000/docs${NC}"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

