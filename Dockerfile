FROM node:12 as builder

WORKDIR /api

COPY . . 

RUN npm ci
RUN npm run build

FROM node:12

COPY --from=builder /api/dist /api
COPY --from=builder /api/node_modules /api/node_modules

ENV NODE_ENV=production
ENV PORT=9100

WORKDIR /api

CMD ["node", "server.js"]
