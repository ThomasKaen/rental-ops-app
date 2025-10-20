# syntax=docker/dockerfile:1.7

# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps (cache-friendly)
COPY package*.json ./
RUN npm ci

# Build
COPY . .
# Optional: inject API base at build time (Vite)
#   docker build --build-arg VITE_API_BASE=/api ...
ARG VITE_API_BASE=
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# ---------- Serve ----------
FROM nginx:1.27-alpine AS serve
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=build /app/dist ./

# Nginx config (SPA + proxy /api to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: reduce image noise
RUN rm -rf /var/cache/apk/*

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
