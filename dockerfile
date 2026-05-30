# Frontend stage
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY ./frontend /app

RUN npm install

RUN npm run build


# Backend stage
FROM node:22-alpine

WORKDIR /app

COPY ./backend /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

CMD ["node", "server.js"]