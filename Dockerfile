FROM node:24-alpine AS frontend
COPY /frontend/package.prod.json /package.json
RUN npm install
COPY /frontend/ .
RUN npm run build

FROM node:24-alpine AS builder
WORKDIR /app
COPY /server/package*.json ./
RUN npm ci
COPY /server/ .
RUN npm run build

FROM node:24-alpine AS backend
WORKDIR /app
COPY --from=frontend /dist public/
COPY --from=builder /app/dist/ dist/
COPY /server/package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV="production" \
    DOMAIN="https://threadxer.cossie.dev" \
    PORT=8080
EXPOSE ${PORT}
CMD ["npm", "run", "start:railway"]