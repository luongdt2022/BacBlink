FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_API_BASE_URL

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

ENV PORT=8080

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
