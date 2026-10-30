# ==============================================================================
# AegisHealth AI - Multi-Stage Production Frontend Dockerfile
# Stage 1: Build static React + TypeScript bundle
# Stage 2: Lean Nginx Alpine image with SPA client-side routing & API proxy
# ==============================================================================

# ----------------- Stage 1: Builder -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and compile production assets
COPY . .
RUN npm run build

# ----------------- Stage 2: Production Nginx Server -----------------
FROM nginx:alpine

# Copy compiled SPA bundle
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration with SPA routing, WebSocket upgrade & API reverse-proxy
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
\n\
    # Static SPA assets\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Reverse proxy REST API & WebSockets to FastAPI backend\n\
    location /api/ {\n\
        proxy_pass http://backend:8000/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_read_timeout 86400;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
