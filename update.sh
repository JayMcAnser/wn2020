#!/usr/bin/env bash
# version 0.4 JvK 2020-02-13 (stash, pm2 runner)

# stop the docker


# remove unused packages
# docker system prune -a -f

# pull the master version with git of the site
git stash
git stash drop -q
git pull

# to update the api
cd api
npm install
npm audit fix

# update the quasar app
cd ..

npm install
npm audit fix

quasar build

cp  -r /var/www/vue/dropper-website/dist/spa/.  /var/www/public_html/

pm2 restart all
# build the quasar de

# docker-compose up -d --no-deps --build webserver

# docker-compose down

# build the docker
# docker-compose build

# start the docker
# docker-compose up -d

