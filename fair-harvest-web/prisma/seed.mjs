import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_DEMO_DATA === "false") {
    console.log("SEED_DEMO_DATA=false — skipping demo seed.");
    return;
  }

  console.log("Seeding demo Government Farmer Card registry...");
  const govRecords = [
    { cardNumber: "BD-FARM-0001", nidNumber: "1990123456789", fullName: "Rahim Uddin", district: "Dhaka", issueDate: new Date("2022-03-14"), status: "ACTIVE", cropTypes: "vegetable,leafy_greens" },
    { cardNumber: "BD-FARM-0002", nidNumber: "1988987654321", fullName: "Amina Khatun", district: "Rangpur", issueDate: new Date("2021-07-02"), status: "ACTIVE", cropTypes: "fruit" },
    { cardNumber: "BD-FARM-0003", nidNumber: "1985456789123", fullName: "Salim Mia", district: "Bogura", issueDate: new Date("2020-11-20"), status: "ACTIVE", cropTypes: "grain" },
    { cardNumber: "BD-FARM-0004", nidNumber: "1993321654987", fullName: "Nasrin Begum", district: "Khulna", issueDate: new Date("2023-01-09"), status: "ACTIVE", cropTypes: "vegetable" },
    { cardNumber: "BD-FARM-0005", nidNumber: "1979112233445", fullName: "Habibur Rahman", district: "Sylhet", issueDate: new Date("2019-05-30"), status: "REVOKED", cropTypes: "herb" },
    { cardNumber: "BD-FARM-0006", nidNumber: "1996556677889", fullName: "Jasmine Akter", district: "Chattogram", issueDate: new Date("2024-02-18"), status: "ACTIVE", cropTypes: "fruit,vegetable" },
    { cardNumber: "BD-FARM-0007", nidNumber: "1982998877665", fullName: "Kamal Hossain", district: "Rajshahi", issueDate: new Date("2018-09-11"), status: "ACTIVE", cropTypes: "grain,herb" },
    { cardNumber: "BD-FARM-0008", nidNumber: "1991443322110", fullName: "Ruma Aktar", district: "Barishal", issueDate: new Date("2022-12-01"), status: "ACTIVE", cropTypes: "vegetable" }
  ];
  for (const record of govRecords) {
    await prisma.govFarmerCardRecord.upsert({ where: { cardNumber: record.cardNumber }, create: record, update: record });
  }

  console.log("Seeding demo users...");
  const [adminPassword, farmerPassword, consumerPassword] = await Promise.all([
    bcrypt.hash("Admin123!", 10),
    bcrypt.hash("Farmer123!", 10),
    bcrypt.hash("FairHarvest123", 10)
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fairharvest.com" },
    create: { email: "admin@fairharvest.com", passwordHash: adminPassword, name: "Fair Harvest Admin", role: "ADMIN" },
    update: {}
  });

  const consumer = await prisma.user.upsert({
    where: { email: "demo@fairharvest.com" },
    create: { email: "demo@fairharvest.com", passwordHash: consumerPassword, name: "Demo Consumer", role: "CONSUMER" },
    update: {}
  });

  const rahimUser = await prisma.user.upsert({
    where: { email: "rahim@fairharvest.com" },
    create: { email: "rahim@fairharvest.com", passwordHash: farmerPassword, name: "Rahim Uddin", role: "FARMER" },
    update: {}
  });

  const karimUser = await prisma.user.upsert({
    where: { email: "karim@fairharvest.com" },
    create: { email: "karim@fairharvest.com", passwordHash: farmerPassword, name: "Karim Sheikh", role: "FARMER" },
    update: {}
  });

  console.log("Seeding farmer profiles (one pre-verified, one pending manual review)...");
  const rahimFarmer = await prisma.farmerProfile.upsert({
    where: { userId: rahimUser.id },
    create: {
      id: "seed-farmer-rahim",
      userId: rahimUser.id,
      farmerCardNumber: "BD-FARM-0001",
      nidNumber: "1990123456789",
      district: "Dhaka",
      verificationStatus: "VERIFIED",
      verificationMethod: "DEMO_REGISTRY",
      verifiedAt: new Date(),
      reputationScore: 88,
      badge: "Trusted Seller"
    },
    update: {}
  });

  const karimFarmer = await prisma.farmerProfile.upsert({
    where: { userId: karimUser.id },
    create: {
      userId: karimUser.id,
      farmerCardNumber: "BD-FARM-9999",
      nidNumber: "1970000000000",
      district: "Comilla",
      verificationStatus: "PENDING",
      verificationMethod: "MANUAL",
      reputationScore: 70,
      badge: "New Farmer"
    },
    update: {}
  });

  console.log("Seeding products...");
  const spinach = await prisma.product.upsert({
    where: { id: "seed-product-spinach" },
    create: {
      id: "seed-product-spinach",
      farmerId: rahimFarmer.id,
      name: "Organic Spinach",
      category: "vegetable",
      description: "Iron-rich leafy greens grown without synthetic pesticides.",
      priceBdt: 120,
      quantityKg: 40,
      freshnessWindowDays: 2,
      trustScore: 91,
      status: "ACTIVE"
    },
    update: {}
  });

  const tomato = await prisma.product.upsert({
    where: { id: "seed-product-tomato" },
    create: {
      id: "seed-product-tomato",
      farmerId: rahimFarmer.id,
      name: "Vine Tomatoes",
      category: "vegetable",
      description: "Sun-ripened tomatoes harvested within 24 hours of listing.",
      priceBdt: 95,
      quantityKg: 60,
      freshnessWindowDays: 4,
      trustScore: 86,
      status: "ACTIVE"
    },
    update: {}
  });

  console.log("Seeding trace events for the demo product...");
  const traceStages = [
    { stage: "PLANTED", daysAgo: 40, note: "Sown in iron-rich soil plot A3" },
    { stage: "HARVESTED", daysAgo: 3, note: "Hand-harvested at dawn" },
    { stage: "LAB_TESTED", daysAgo: 2, note: "Pesticide residue test passed" },
    { stage: "PACKAGED", daysAgo: 2, note: "Packed in ventilated crates" },
    { stage: "SHIPPED", daysAgo: 1, note: "Dispatched to Dhaka distribution hub" },
    { stage: "LISTED", daysAgo: 0, note: "Listed on Fair Harvest marketplace" }
  ];
  for (const step of traceStages) {
    const timestamp = new Date(Date.now() - step.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.traceEvent.create({
      data: { productId: spinach.id, stage: step.stage, timestamp, note: step.note, gpsLat: 23.8103, gpsLng: 90.4125 }
    });
  }

  console.log("Seeding a sample order with status history...");
  const existingOrder = await prisma.order.findFirst({ where: { userId: consumer.id } });
  if (!existingOrder) {
    const order = await prisma.order.create({
      data: {
        userId: consumer.id,
        status: "DELIVERED",
        totalBdt: 120 + 60,
        deliveryFeeBdt: 60,
        deliveryLine1: "House 12, Green Road",
        deliveryCity: "Dhaka",
        paymentMethod: "DEMO_CARD",
        paymentStatus: "PAID",
        items: {
          create: [
            { productId: spinach.id, farmerId: rahimFarmer.id, nameSnapshot: spinach.name, quantityKg: 1, unitPriceBdt: spinach.priceBdt, lineTotalBdt: spinach.priceBdt }
          ]
        },
        statusEvents: {
          create: [
            { status: "PENDING", note: "Order placed" },
            { status: "CONFIRMED", note: "Farmer confirmed availability" },
            { status: "SHIPPED", note: "Out for delivery" },
            { status: "DELIVERED", note: "Delivered to customer" }
          ]
        }
      }
    });
    await prisma.payment.create({
      data: { orderId: order.id, method: "DEMO_CARD", amountBdt: order.totalBdt, status: "PAID", demoTransactionRef: `DEMO-${order.id.slice(0, 8)}`, paidAt: new Date() }
    });
    await prisma.rewardsLedger.create({
      data: { userId: consumer.id, points: 20, reason: "Healthy purchase" }
    });
  }

  console.log("Seed complete.");
  console.log("Demo logins: admin@fairharvest.com / Admin123!, rahim@fairharvest.com / Farmer123! (verified),");
  console.log("karim@fairharvest.com / Farmer123! (pending), demo@fairharvest.com / FairHarvest123 (consumer).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
