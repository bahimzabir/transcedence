
FROM alpine:latest

RUN apk update && apk upgrade
RUN apk add nodejs npm git
RUN apk add --no-cache openssh-client

EXPOSE 3000

RUN mkdir -p /app
WORKDIR /app

RUN echo "git clone https://github.com/bahimzabir/transcedence.git" >> script.sh
RUN echo "cd transcedence" >> script.sh
RUN echo "npm install" >> script.sh
RUN echo "sleep 5 && npx prisma migrate dev --name init" >> script.sh
RUN echo "npm run start:dev" >> script.sh
RUN chmod +x script.sh

CMD ./script.sh
