FROM node:12.6

ENV NODE_ENV=production
ENV NODE_PATH=/api
ENV PORT=9100

COPY dist /api
COPY package*.json ./
RUN npm install

WORKDIR /api

EXPOSE 9100

CMD ["node", "server.js"]
