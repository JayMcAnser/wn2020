# from: https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html
# build stage
FROM node:lts-alpine as build-stage
# FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
# COPY /app/dist/spa /var/www/html
