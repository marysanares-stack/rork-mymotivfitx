# Use Node.js as the base image
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including tsx)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY backend/ ./backend/
COPY types/ ./types/
COPY tsconfig.json ./
COPY .env ./.env

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npx tsc --project tsconfig.json --outDir dist --skipLibCheck

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./prisma/dev.db"

# Start the compiled server
CMD ["node", "dist/backend/server.js"]
