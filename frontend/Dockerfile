FROM node:22-alpine AS build

WORKDIR /app

# 1. Install deps
COPY package.json package-lock.json ./
RUN npm install

# 2. Copy source (but NOT node_modules, thanks to .dockerignore)
COPY . .

# 3. Build
RUN npm run build

# --- Runtime image ---
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
