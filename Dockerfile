FROM node:20-alpine

WORKDIR /app

COPY /backend/package.json .

COPY /frontend/package.json /frontend/

RUN cd /frontend/ && npm install --legacy-peer-deps

RUN cd /app/ && npm install

COPY /frontend /frontend

COPY /backend .

RUN cd /frontend && npm run build

RUN cd /app && npm run build

RUN mv /frontend/dist/ /app/public && rm -rf /frontend

CMD ["npm", "start"]