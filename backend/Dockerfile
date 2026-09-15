FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "backend/src/app.js"]

