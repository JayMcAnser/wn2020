#!/bin/bash
# Start mongo in any directory
docker run -d -p 27017:27017 mongo

# start docker in a fix directory
# docker run -d -p 27017:27017 -v ~/data:/data/db mongo

