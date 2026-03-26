import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.batchPost.deleteMany();
  await prisma.scheduledPost.deleteMany();
  await prisma.uploadBatch.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.entity.deleteMany();

  await prisma.entity.createMany({
    data: [
      { name: "YPLORE Main", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Spongebob 1", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Spongebob 2", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Funny Animals", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Trumpet Pickle", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Crazy Garfield", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Garfield Tube", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Mickey Mouse", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Alien Cat", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Angry Box Cat", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Gumball Free", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "I am Macaroni", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "MEOW FOTW", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Baby Patrick", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "Digistore16", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Animals", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Cars", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Travel", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Amazon", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Tec", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Gadgets", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Beauty", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Clothing", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Sports", apiKey: "API_KEY_HIER_EINFUEGEN" },
      { name: "YPLORE Media", apiKey: "API_KEY_HIER_EINFUEGEN" },
    ],
  });

  const entities = await prisma.entity.findMany();

  for (const entity of entities) {
    const createdAccounts = await prisma.socialAccount.createManyAndReturn({
  data: [
    {
      entityId: entity.id,
      platform: "tiktok",
      handle: `${entity.name} TikTok`,
    },
    {
      entityId: entity.id,
      platform: "instagram",
      handle: `${entity.name} Instagram`,
    },
    {
      entityId: entity.id,
      platform: "youtube",
      handle: `${entity.name} YouTube`,
    },
  ],
});

await prisma.scheduledPost.createMany({
  data: [
    {
      entityId: entity.id,
      accountId: createdAccounts.find((a) => a.platform === "tiktok")?.id,
      platform: "tiktok",
      title: "Demo TikTok Post",
      caption: `${entity.name} TikTok Demo Caption`,
      videoUrl: "https://example.com/demo-tiktok.mp4",
      scheduledAt: new Date("2026-03-24T10:00:00.000Z"),
      status: "planned",
    },
    {
      entityId: entity.id,
      accountId: createdAccounts.find((a) => a.platform === "instagram")?.id,
      platform: "instagram",
      title: "Demo Instagram Reel",
      caption: `${entity.name} Instagram Reel Demo Caption`,
      videoUrl: "https://example.com/demo-instagram.mp4",
      scheduledAt: new Date("2026-03-24T12:00:00.000Z"),
      status: "planned",
    },
    {
      entityId: entity.id,
      accountId: createdAccounts.find((a) => a.platform === "youtube")?.id,
      platform: "youtube",
      title: "Demo YouTube Short",
      caption: `${entity.name} YouTube Short Demo Caption`,
      videoUrl: "https://example.com/demo-youtube.mp4",
      scheduledAt: new Date("2026-03-24T14:00:00.000Z"),
      status: "planned",
    },
  ],
});
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });