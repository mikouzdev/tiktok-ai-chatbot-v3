# backend/Dockerfile
FROM node:24 as frontend
WORKDIR /app
COPY ../client ./
RUN npm ci && npm run build

FROM node:24 as backend
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server ./
COPY --from=frontend /app/dist ./dist/client
CMD ["node", "dist/server.js"]
