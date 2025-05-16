#!/bin/bash

# This script is used to start the backend and frontend of the application.

# Start the backend server
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"
sleep 5
# Start the frontend server
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"
sleep 5
# Check if both servers are running
if ps -p $BACKEND_PID > /dev/null && ps -p $FRONTEND_PID > /dev/null; then
    echo "Both servers are running."
else
    echo "One or both servers failed to start."
fi
# Wait for both servers to finish
wait $BACKEND_PID
wait $FRONTEND_PID
# Clean up
echo "Cleaning up..."
kill $BACKEND_PID
kill $FRONTEND_PID
echo "Backend and frontend servers stopped."
# Exit the script
exit 0