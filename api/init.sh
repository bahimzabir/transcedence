#!/bin/sh
sleep 10
npx prisma migrate dev --name init || npx prisma migrate deploy --schema ./prisma/schema.prisma
sleep 5
npm run start:dev
