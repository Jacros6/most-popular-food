# -------------------------------
# Stage 1: Build Angular Frontend
# -------------------------------
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build Angular in production mode
RUN npm run build:prod

# -------------------------------
# Stage 2: Build Backend
# -------------------------------
FROM node:18

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend/ ./backend

# Copy frontend production build into backend's dist folder
COPY --from=frontend-build /app/frontend/dist/most-popular-food ./dist/most-popular-food

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "backend/src/server.js"]
