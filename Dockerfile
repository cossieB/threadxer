FROM node:22-alpine

COPY /packages/server/package.json /server/package.json

COPY /packages/frontend/package.prod.json /frontend/package.json

RUN cd /frontend/ && npm install

RUN cd /server/ && npm install

COPY /packages/frontend /frontend

COPY /packages/server /server

RUN cd /frontend && npm run build

RUN cd /server && npm run build

RUN mv /frontend/dist/ /server/public && rm -rf /frontend

EXPOSE 8080

ARG DATABASE_URL

ARG REDIS_URL

ARG REDIS_PRIVATE_URL

ENV DATABASE_URL=${DATABASE_URL} \
    REDIS_URL=${REDIS_URL} \
    REDIS_PRIVATE_URL=${REDIS_PRIVATE_URL} \
    NODE_ENV="production" \
    DOMAIN="https://threadxer.cossie.dev"

WORKDIR /server

CMD ["npm", "run", "start:railway"]