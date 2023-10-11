
FROM node:latest

EXPOSE 5757

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./

CMD ["sh", "./init.sh"]

