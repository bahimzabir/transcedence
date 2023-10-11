#!/bin/sh
sleep 10
npx prisma migrate dev --name init || npx prisma migrate deploy --schema ./prisma/schema.prisma
sleep 30
npm run start:dev
