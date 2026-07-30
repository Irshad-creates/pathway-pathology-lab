# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS dependencies
# Copy only package files first for better Docker layer caching
COPY package.json package-lock.json* ./
# Install production dependencies only
RUN npm ci --omit=dev

# ---- Production Stage ----
FROM base AS production

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Remove dev files not needed in production
RUN rm -f .env .env.example package-dependencies.txt

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port (Render uses PORT env variable)
EXPOSE ${PORT:-5000}

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
