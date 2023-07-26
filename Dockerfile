#from nest
FROM nestjs/cli:latest as nest

RUN apk update && apk upgrade
RUN apk add nodejs npm git

EXPOSE 3000

RUN mkdir -p /app
WORKDIR /app

#clone form github
RUN git clone git@github.com:bahimzabir/transcedence.git
WORKDIR /app/transcedence
RUN npm install
RUN npm run db:dev:restart
#CMD npm run start:dev

CMD ["npm", "run", "start:dev"]
