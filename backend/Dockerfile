# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for native module compilation
RUN apk add --no-cache \
    ca-certificates \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    python3 \
    make \
    g++

# Copy package files FIRST (before anything else for better caching)
COPY package*.json ./

# Configure npm for faster, more reliable builds
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=1024

# Increase npm timeouts and retry settings for unreliable networks
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set registry https://registry.npmjs.org/

# Clear cache before install for clean state
RUN npm cache clean --force

# Install dependencies with optimized settings
RUN npm ci \
    --only=production \
    --prefer-offline \
    --omit=dev \
    --omit=optional \
    --legacy-peer-deps \
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
