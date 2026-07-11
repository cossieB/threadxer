FROM node:24-alpine AS frontend
COPY /frontend/package.prod.json /package.json
RUN npm install
COPY /frontend/ .
RUN npm run build


FROM node:24-alpine AS backend
WORKDIR /app
ENV PORT=8080
COPY --from=frontend /dist /app/public
COPY /server/package.json package.json
RUN cd /app/ && npm install
COPY /server .
RUN cd /app && npm run build
EXPOSE ${PORT}
ENV NODE_ENV="production" \
    DOMAIN="https://threadxer.cossie.dev"
CMD ["npm", "run", "start:railway"]