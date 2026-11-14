# ========================================================
# ETAPA 1: Compilación del Portal E-commerce (Astro)
# ========================================================
FROM node:22-alpine AS builder-ecommerce
WORKDIR /app/ecommerce

COPY apps/ecommerce/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY apps/ecommerce/ ./
RUN npm run build

# ========================================================
# ETAPA 2: Compilación de la PWA Mobile (React + Vite PWA)
# ========================================================
FROM node:22-alpine AS builder-pwa
WORKDIR /app/pwa

COPY apps/pwa/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY apps/pwa/ ./
RUN npm run build

# ========================================================
# ETAPA 3: Compilación del Panel Administrativo (React + Vite)
# ========================================================
FROM node:22-alpine AS builder-admin
WORKDIR /app/admin

COPY apps/admin/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY apps/admin/ ./
RUN npm run build

# ========================================================
# ETAPA 4: Runtime Final (Node.js API + SQLite + Servidor Unificado)
# ========================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_DB_PATH=/app/server/data/database.sqlite

# 1. Instalar dependencias del servidor backend
COPY server/package*.json ./server/
RUN cd server && if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# 2. Copiar código fuente del backend
COPY server/ ./server/

# 3. Crear directorio persistente para SQLite y declarar volumen
RUN mkdir -p /app/server/data
VOLUME ["/app/server/data"]

# 4. Copiar las 3 capas compiladas al directorio público del backend
COPY --from=builder-ecommerce /app/ecommerce/dist ./server/public/ecommerce
COPY --from=builder-pwa /app/pwa/dist ./server/public/pwa
COPY --from=builder-admin /app/admin/dist ./server/public/admin

# 5. Exponer puerto HTTP estándar
EXPOSE 3000

# 6. Iniciar la plataforma
CMD ["node", "server/src/app.js"]
