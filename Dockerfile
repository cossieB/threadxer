FROM node:20-alpine

WORKDIR /app

COPY /backend/package.json .

COPY /frontend/package.json /frontend/

RUN cd /frontend/ && npm install

RUN cd /app/ && npm install

COPY /frontend /frontend

COPY /backend .

RUN cd /frontend && npm run build

RUN cd /app && npm run build

RUN mv /frontend/dist/ /app/public && rm -rf /frontend

EXPOSE 8080

ARG DATABASE_URL

ARG REDIS_URL

ARG REDIS_PRIVATE_URL

ENV DATABASE_URL=${DATABASE_URL} \
    REDIS_URL=${REDIS_URL} \
    REDIS_PRIVATE_URL=${REDIS_PRIVATE_URL}

CMD ["npm", "run", "start:railway"]