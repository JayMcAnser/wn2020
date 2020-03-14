#Docker setup
What we need is:
- a https server
- a front-end based upon quasar
- a backend based upon node (hapi)
- access to an database for the backend

Nice to have
- a dev and a prod enviroment
- secure

## setting up the https (nginx) server
### adjusting the DNS
The DNS needs a AAAA record to use the letscrypt certificat. This (https://www.ipaddressguide.com/ipv4-to-ipv6) site will
convert the ip4 to the required ip6. Create a www record with type AAAA and the value returned

Now we can create the certificate. This can be done on the server.

## setting up docker-compose

We will create a separate docker definition for the quasar part. The will be stored in the quasar-dockerfile. The configuration
of the nginx server is done in the /nginx-conf directory.


the generaral docker file (docker-compose.yml)
```dockerfile
version: '3'

services:
#  nodejs:
#    build:
#      context: .
#      dockerfile: __Dockerfile
#    image: nodejs
#    container_name: nodejs
#    restart: unless-stopped
#    networks:
#      - app-network

  webserver:
    image: nginx:mainline-alpine
    container_name: webserver
    restart: unless-stopped
    build:
      context: .
      dockerfile: quasar.dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - web-root:/var/www/html
      - ./nginx-conf:/etc/nginx/conf.d
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - dhparam:/etc/ssl/certs

#    depends_on:
#      - nodejs
    networks:
      - app-network

  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - web-root:/var/www/html
    depends_on:
      - webserver
    command: certonly --webroot --webroot-path=/var/www/html --email info@toxus.nl --agree-tos --no-eff-email --force-renewal -d dropper.info  -d www.dropper.info

volumes:
  certbot-etc:
  certbot-var:
  web-root:
    driver: local
    driver_opts:
      type: none
      device: /home/dropper/
      o: bind
  dhparam:
    driver: local
    driver_opts:
      type: none
      device: /home/dropper/dhparam/
      o: bind

networks:
  app-network:
    driver: bridge

```

This will create a docker that runs the the quasar definition. The node part is not active!
Important is the volumes **/home/dropper/**

##nginx configuration
In the directory /nginx-conf is the file nginx.conf

```apacheconfig
server {
        listen 80;
        listen [::]:80;
        server_name dropper.info www.dropper.info;

        location ~ /.well-known/acme-challenge {
          allow all;
          root /usr/share/nginx/html;
        }

        location / {
                rewrite ^ https://$host$request_uri? permanent;
        }
}

server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name dropper.info www.dropper.info;

        server_tokens off;

        ssl_certificate /etc/letsencrypt/live/dropper.info/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/dropper.info/privkey.pem;

        ssl_buffer_size 8k;

        ssl_dhparam /etc/ssl/certs/dhparam-2048.pem;

        ssl_protocols TLSv1.2 TLSv1.1 TLSv1;
        ssl_prefer_server_ciphers on;

        ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DH+3DES:!ADH:!AECDH:!MD5;

        ssl_ecdh_curve secp384r1;
        ssl_session_tickets off;

        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 8.8.8.8;

#        location / {
#                try_files $uri @nodejs;
#        }
#
#        location @nodejs {
#                proxy_pass http://nodejs:8080;
#                add_header X-Frame-Options "SAMEORIGIN" always;
#                add_header X-XSS-Protection "1; mode=block" always;
#                add_header X-Content-Type-Options "nosniff" always;
#                add_header Referrer-Policy "no-referrer-when-downgrade" always;
#                add_header Content-Security-Policy "default-src * data: 'unsafe-eval' 'unsafe-inline'" always;
                # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
                # enable strict transport security only if you understand the implications
#        }

        root /usr/share/nginx/html;
        index index.html index.htm index.nginx-debian.html;
}
```

This configuration will take care that all request will be https

## The quasar docker
This file will copy the current content and place it into the container

```dockerfile
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

```

## building the app on the server

There is a short shell script to do this:
```shell script
#!/usr/bin/env bash
# version 0.2 JvK 2019-09-22

# pull the master version with git of the site

git pull

docker-compose up -d --no-deps --build webserver


```
