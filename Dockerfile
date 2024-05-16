# syntax=docker/dockerfile:1

FROM node:21-bookworm

RUN mkdir -v -p /usr/local/app
WORKDIR /usr/local/app

COPY --chown=1000:1000 --chmod=644 package.json /usr/local/app/package.json
COPY --chown=1000:1000 --chmod=644 package-lock.json /usr/local/app/package-lock.json
COPY --chown=1000:1000 --chmod=755 dist /usr/local/app/dist
COPY --chown=1000:1000 --chmod=755 image /usr/local/app/image

ENV NODE_ENV=production

RUN npm clean-install --omit=dev

ENTRYPOINT [ "node", "/usr/local/app" ]
