# Use an official Node.js image
FROM node:18

# Create app directory
WORKDIR /LanceJob_Platforme_Freelance

# Copy package files and install dependencies
COPY . .
# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies
RUN cd frontend && npm install

# Expose port for the backend
EXPOSE 3000
# Expose port for the frontend
EXPOSE 5000


# Start the application
CMD ["./start.sh"]
