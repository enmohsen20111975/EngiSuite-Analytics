# EngiSuite Analytics - Dockerfile for Production Deployment (MySQL)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (mysql2 is pure JS - no native compilation needed)
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy built application
COPY dist ./dist/
COPY public ./public/

# Create data and logs directories
RUN mkdir -p /app/data /app/logs /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000
# DATABASE_URL must be set at runtime via environment variable or docker-compose

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
