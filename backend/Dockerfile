# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with optimizations for faster builds
# Skip Puppeteer chromium download since we install it via apk
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci --only=production \
    --prefer-offline \
    --no-audit \
    --omit=optional \
    --maxsockets=1 \
    && npm cache clean --force

# Runtime stage - use Alpine for lightweight production image
FROM node:20-alpine

WORKDIR /app

# Install minimal Puppeteer dependencies for Alpine
# Note: Puppeteer requires chromium which may not work well on Alpine
# Consider using system browser or simplifying dependencies
RUN apk add --no-cache \
    ca-certificates \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Copy node_modules and production files from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy only necessary application files (src and package files)
COPY src ./src
COPY package.json package-lock.json ./

# Note: Test files, logs, documentation, and other non-essential files 
# are excluded via .dockerignore and not needed in production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["npm", "start"]
