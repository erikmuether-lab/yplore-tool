import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.batchPost.deleteMany();
  await prisma.uploadBatch.deleteMany();
  await prisma.scheduledPost.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.entity.deleteMany();

  const yploreMain = await prisma.entity.create({
    data: {
      name: "YPLORE Main",
      apiKey: "",
      accounts: {
        create: [
          {
            platform: "tiktok",
            handle: "@_yplore",
            externalAccountId: null,
          },
          {
            platform: "instagram",
            handle: "@y.plore",
            externalAccountId: null,
          },
          {
            platform: "youtube",
            handle: "@ypiore",
            externalAccountId: null,
          },
        ],
      },
    },
    include: {
      accounts: true,
    },
  });

  const funnyAnimals = await prisma.entity.create({
    data: {
      name: "Funny Animals",
      apiKey: "",
      accounts: {
        create: [
          {
            platform: "tiktok",
            handle: "@funnyanimals",
            externalAccountId: null,
          },
          {
            platform: "instagram",
            handle: "@funnyanimals",
            externalAccountId: null,
          },
          {
            platform: "youtube",
            handle: "@funnyanimals",
            externalAccountId: null,
          },
        ],
      },
    },
    include: {
      accounts: true,
    },
  });

  const yploreTravel = await prisma.entity.create({
    data: {
      name: "YPLORE Travel",
      apiKey: "",
      accounts: {
        create: [
          {
            platform: "tiktok",
            handle: "@yploretravel",
            externalAccountId: null,
          },
          {
            platform: "instagram",
            handle: "@yploretravel",
            externalAccountId: null,
          },
          {
            platform: "youtube",
            handle: "@yploretravel",
            externalAccountId: null,
          },
        ],
      },
    },
    include: {
      accounts: true,
    },
  });

  const entities = [yploreMain, funnyAnimals, yploreTravel];

  for (const entity of entities) {
    const tiktokAccount =
      entity.accounts.find((account) => account.platform === "tiktok") ?? null;
    const instagramAccount =
      entity.accounts.find((account) => account.platform === "instagram") ?? null;
    const youtubeAccount =
      entity.accounts.find((account) => account.platform === "youtube") ?? null;

    await prisma.scheduledPost.createMany({
      data: [
        {
          entityId: entity.id,
          accountId: tiktokAccount?.id ?? null,
          platform: "tiktok",
          title: "Demo TikTok",
          caption: `Demo TikTok Post für ${entity.name}`,
          videoUrl: "/uploads/demo-tiktok.mp4",
          publicVideoUrl: null,
          videoFileName: "demo-tiktok.mp4",
          scheduledAt: new Date("2026-03-23T10:00:00.000Z"),
          status: "planned",
        },
        {
          entityId: entity.id,
          accountId: instagramAccount?.id ?? null,
          platform: "instagram",
          title: "Demo Instagram",
          caption: `Demo Instagram Reel für ${entity.name}`,
          videoUrl: "/uploads/demo-instagram.mp4",
          publicVideoUrl: null,
          videoFileName: "demo-instagram.mp4",
          scheduledAt: new Date("2026-03-23T12:00:00.000Z"),
          status: "planned",
        },
        {
          entityId: entity.id,
          accountId: youtubeAccount?.id ?? null,
          platform: "youtube",
          title: "Demo YouTube",
          caption: `Demo YouTube Short für ${entity.name}`,
          videoUrl: "/uploads/demo-youtube.mp4",
          publicVideoUrl: null,
          videoFileName: "demo-youtube.mp4",
          scheduledAt: new Date("2026-03-23T14:00:00.000Z"),
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