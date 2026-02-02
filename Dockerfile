FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8787

ENV WORKER_PORT=8787

CMD ["node", "worker_server.js"]
