
FROM node:latest

EXPOSE 3000

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "./init.sh"]
