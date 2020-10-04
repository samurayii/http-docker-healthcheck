FROM ubuntu:18.04

RUN apt-get update && \
    apt-get install -y curl bash && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash && \
    apt-get install -y nodejs && \
    node -v && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*  && \
    rm -f /var/cache/apt/archives/*.deb  && \
    rm -f var/cache/apt/archives/partial/*.deb  && \
    rm -f /var/cache/apt/*.bin

RUN curl -Lo /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && \
    chmod 755 /usr/local/bin/dumb-init

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["node", "/app.js"]

COPY app.js /app.js