FROM ubuntu:20.04

#ENV APP_RESTARTER "true"
ARG APP_RESTARTER_VERSION 0.0.7

RUN apt-get update && \
    apt-get install -y curl bash && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash && \
    apt-get install -y nodejs && \
    node -v && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*  && \
    rm -f /var/cache/apt/archives/*.deb  && \
    rm -f var/cache/apt/archives/partial/*.deb  && \
    rm -f /var/cache/apt/*.bin

RUN npm install app-restarter@${APP_RESTARTER_VERSION} -g && \
    app-restarter -v

RUN curl -Lo /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && \
    chmod 755 /usr/local/bin/dumb-init

COPY start.sh /start

RUN chmod +x /start

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["/bin/bash", "/start"]

COPY package.json /http-docker-healthcheck/package.json
COPY package-lock.json /http-docker-healthcheck/package-lock.json
COPY app /http-docker-healthcheck
COPY config.toml /http-docker-healthcheck/config.toml


RUN cd /http-docker-healthcheck && \
    npm ci && \
    node app.js -v