FROM node:12.16

ENV NODE_ENV=production
ENV PORT=9100

COPY dist /api
COPY package*.json ./
RUN npm install

WORKDIR /api

EXPOSE 9100

CMD ["node", "server.js"]
      # - run: npm run build
      # # cache distribution and files needed for deployment
      # - save_cache:
      #     key: v1-build-{{ .Environment.CIRCLE_SHA1 }}
      #     paths:
      #       - dist
      #       - package-lock.json
      #       - package.json
      #       - Dockerfile
