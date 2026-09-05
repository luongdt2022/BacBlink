FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_API_PREFIX=api
ARG VITE_API_VERSION=v1

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_PREFIX=$VITE_API_PREFIX
ENV VITE_API_VERSION=$VITE_API_VERSION

RUN npm run build

FROM node:22-alpine AS runner

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "-s", "/app/dist", "-l", "3000"]
