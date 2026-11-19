# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN HUSKY=0 npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Ensure appuser owns the app directory
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3013

CMD ["node", "dist/main"]
