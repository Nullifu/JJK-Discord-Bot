# syntax=docker/dockerfile:1

FROM node:21

RUN mkdir --verbose --parents /usr/local/app
WORKDIR /usr/local/app

COPY --chown=1000:1000 --chmod=644 package.json /usr/local/app/package.json
COPY --chown=1000:1000 --chmod=644 package-lock.json /usr/local/app/package-lock.json
COPY --chown=1000:1000 --chown=755 dist /usr/local/app/dist

RUN npm install --omit=dev

ENTRYPOINT [ "node", "/usr/local/app" ]
