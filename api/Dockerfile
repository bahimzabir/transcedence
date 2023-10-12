
FROM node:latest

EXPOSE 3000

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./


COPY . .

CMD ["sh", "./init.sh"]
