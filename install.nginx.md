# Install docker server


[ip4 to AAAA](https://www.ipaddressguide.com/ipv4-to-ipv6)

[letscrypt](https://www.bennadel.com/blog/3419-from-noob-to-docker-on-digitalocean-with-nginx-node-js-datadog-logs-dogstatsd-and-letsencrypt-ssl-certificates.htm)

Create the certificat on the server
```
docker run -it --rm --name letsencrypt \
    -v "/etc/letsencrypt:/etc/letsencrypt" \
    -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
    -v "/tmp/letsencrypt/www:/var/www" \
    quay.io/letsencrypt/letsencrypt:latest \
        certonly \
        -d dropper.info \
        -d www.dropper.info \
        --authenticator webroot \
        --webroot-path /var/www \
        --renew-by-default \
        --server https://acme-v01.api.letsencrypt.org/directory
```

[ssl](https://www.digitalocean.com/community/tutorials/how-to-secure-a-containerized-node-js-application-with-nginx-let-s-encrypt-and-docker-compose#prerequisites) 

