
FROM node:latest

EXPOSE 3000

RUN mkdir -p /app

WORKDIR /app

# COPY package*.json ./

# RUN npm install
# RUN npm audit fix

# COPY . .

# RUN npx prisma migrate dev --name init --preview-feature


CMD ["sh", "./init.sh"]
