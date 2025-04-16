#!/bin/bash

# Define project directories (update these paths as needed)
FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"
SOCKET_DIR="./socket_server"
VENV_PATH="$BACKEND_DIR/venv/bin/activate"

# Start tmux session for frontend
tmux new-session -d -s frontend "cd $FRONTEND_DIR && npm run dev"
echo "Frontend started in tmux session: frontend"

# Start tmux session for backend
tmux new-session -d -s backend "bash -c 'cd $BACKEND_DIR && source $VENV_PATH && uvicorn main:app --reload --host 0.0.0.0 --port 8000'"
echo "Backend started in tmux session: backend"

# Start tmux session for socket server
tmux new-session -d -s socket "cd $SOCKET_DIR && node server.js"
echo "Socket server started in tmux session: socket"

# Display running tmux sessions
tmux list-sessions

