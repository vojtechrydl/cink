FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
RUN npm ci --include=dev

COPY . .
RUN npm run build -w client
RUN npm run build -w server

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/src/db/migrations ./server/src/db/migrations
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/seed/trams.json ./seed/trams.json
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev -w server --ignore-scripts

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/dist/server/src/index.js"]
