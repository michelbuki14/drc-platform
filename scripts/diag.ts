import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const inst = await p.flightInstance.findFirst({ where: { flightNo: "WB 1520" }, include: { passengers: true, crew: true } });
  console.log("WB instance id:", inst && inst.id);
  console.log("passengers:", inst && inst.passengers.length);
  console.log("crew:", inst && inst.crew.length);
  console.log("total passengers in DB:", await p.passenger.count());
  await p.$disconnect();
})();
