const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.user.findMany().then((users) => {
  console.log("Success", users);
}).catch(console.error).finally(() => {
  prisma.$disconnect();
});
