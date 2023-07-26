#from nest
FROM node:latest

# RUN apk update && apk upgrade
# RUN apk add git
# RUN apk add --no-cache openssh-client

EXPOSE 3000

RUN mkdir -p /app
WORKDIR /app

#clone form github
RUN git clone https://github.com/bahimzabir/transcedence.git
WORKDIR /app/transcedence
RUN npm install
#RUN npx prisma migrate dev --name init
#CMD npm run start:dev
CMD ["npm", "run", "start:dev", ";" , "npx", "prisma", "migrate", "dev", "--name", "init"]
