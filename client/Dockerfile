FROM node:latest

EXPOSE 5757

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./


RUN npm install
RUN npm audit fix

# COPY . .


CMD ["sh", "./init.sh"]