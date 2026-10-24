import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../src/lib/demo-seed";

const db = new PrismaClient();

seedDemo(db)
  .then(({ seller, products }) => {
    console.log(`Seeded demo seller ${seller.name} (${seller.phone}) with ${products.length} products.`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
