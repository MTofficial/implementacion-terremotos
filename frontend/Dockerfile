# frontend/Dockerfile

# --- Fase 1: Construcción (Builder) ---
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Fase 2: Producción (Nginx) ---
FROM nginx:alpine
# Copiamos la carpeta 'dist' generada por Vite al servidor Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Exponemos el puerto estándar de web
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]