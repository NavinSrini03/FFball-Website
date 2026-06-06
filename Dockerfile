FROM node:22-alpine

WORKDIR /app
COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4176

EXPOSE 4176
CMD ["node", "server.js"]
