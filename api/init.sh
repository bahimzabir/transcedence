#!/bin/sh
sleep 5
npm i
npx prisma migrate dev --name init
npm run start:dev
npx prisma studio
