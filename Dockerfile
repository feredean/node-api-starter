FROM node:12.16

ENV NODE_ENV=production
ENV PORT=9100

COPY dist /api
COPY package*.json ./
RUN npm install

WORKDIR /api

EXPOSE 9100

CMD ["node", "server.js"]
