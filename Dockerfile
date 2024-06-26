FROM node:20-alpine

WORKDIR /app

COPY /server/package.json package.json

COPY /frontend/package.prod.json /frontend/package.json

RUN cd /frontend/ && npm install

RUN cd /app/ && npm install

COPY /frontend /frontend

COPY /server .

RUN cd /frontend && npm run build

RUN cd /app && npm run build

RUN mv /frontend/dist/ /app/public && rm -rf /frontend

EXPOSE 8080

ARG DATABASE_URL

ARG REDIS_URL

ARG REDIS_PRIVATE_URL

ENV DATABASE_URL=${DATABASE_URL} \
    REDIS_URL=${REDIS_URL} \
    REDIS_PRIVATE_URL=${REDIS_PRIVATE_URL} \
    NODE_ENV="production" \
    DOMAIN="https://threadxer.cossie.dev"

CMD ["npm", "run", "start:railway"]