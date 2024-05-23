# syntax=docker/dockerfile:1

FROM node:21-bookworm

RUN mkdir -v -p /usr/local/app
WORKDIR /usr/local/app

COPY --chown=1000:1000 --chmod=644 package.json /usr/local/app/package.json
COPY --chown=1000:1000 --chmod=644 yarn.lock /usr/local/app/yarn.lock
COPY --chown=1000:1000 --chmod=644 .yarnrc.yml /usr/local/app/.yarnrc.yml
COPY --chown=1000:1000 --chmod=755 dist /usr/local/app/dist
COPY --chown=1000:1000 --chmod=755 .yarn /usr/local/app/.yarn
COPY --chown=1000:1000 --chmod=755 image /usr/local/app/image

ENV NODE_ENV=production

RUN yarn install --immutable

ENTRYPOINT [ "node", "/usr/local/app" ]
