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
RUN export DATABASE_URL="postgresql://postgres:123@172.20.0.1:5432/nest?schema=public"
RUN echo "npx prisma migrate dev --name init" >> script.sh
RUN echo "npm run start:dev" >> script.sh
RUN chmod +x script.sh
#RUN npx prisma migrate dev --name init
#CMD npm run start:dev
CMD ./script.sh
