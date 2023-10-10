#!/bin/sh
<<<<<<< HEAD
sleep 10
npx prisma migrate dev --name init || npx prisma migrate deploy --schema ./prisma/schema.prisma
sleep 30
npm run start:dev
=======
sleep 5
npx prisma migrate dev --name init
npm run start:dev
npx prisma studio
>>>>>>> 71e58d7ca1d68a0440feba9794b121fe987f60e5
