#!/usr/bin/dumb-init /bin/bash

if [[ $APP_RESTARTER ]]; then
    app-restarter -e "node app.js --config ./config.toml" -tmp /app_restarter_tmp -c /http-docker-healthcheck
else
    cd /http-docker-healthcheck
    node app.js --config ./config.toml
fi