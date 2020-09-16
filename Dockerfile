FROM node:12-alpine AS builder

ENV NODE_WORKDIR /app
WORKDIR $NODE_WORKDIR

ADD . $NODE_WORKDIR

RUN rm -rf dist
RUN npm install
RUN npm run build

FROM node:12-alpine

ENV NODE_WORKDIR /app
WORKDIR $NODE_WORKDIR

COPY --from=builder $NODE_WORKDIR/build ./dist
COPY package* ./
COPY locales ./locales
RUN npm install --production