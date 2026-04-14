import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DATA = [
  {
    name: "YPLORE Main",
    apiKey: "",
    accounts: {
      tiktok: "69a1d4c1dc8cab9432aaeaef6",
      instagram: "69c47fb86cb78bcf4c9da19e",
      youtube: "69a1d4dedc8cab9432aaeb2e",
    },
  },
  {
    name: "SpongeBob 1",
    apiKey: "",
    accounts: {
      tiktok: "69a1d82ddc8cab9432aaf097",
      instagram: "69a1d8e2dc8cab9432aaf219",
      youtube: "69a1d846dc8cab9432aaf0c8",
    },
  },
  {
    name: "SpongeBob 2",
    apiKey: "",
    accounts: {
      tiktok: "69a1da7ddc8cab9432aaf54e",
      instagram: "69a1dbcadc8cab9432aaf86d",
      youtube: "69a1da92dc8cab9432aaf579",
    },
  },
  {
    name: "Funny Animals",
    apiKey: "",
    accounts: {
      tiktok: "69a1dd1edc8cab9432aafcf0",
      instagram: "69a1dd79dc8cab9432aafd7c",
      youtube: "69a1dd2edc8cab9432aafd09",
    },
  },
  {
    name: "Alien Cat",
    apiKey: "",
    accounts: {
      tiktok: "69a2c143dc8cab9432ac5e3c",
      instagram: "69a97828dc8cab9432ba4d34",
      youtube: "69a2c164dc8cab9432ac5e87",
    },
  },
  {
    name: "Angry Box Cat",
    apiKey: "",
    accounts: {
      tiktok: "69a2c201dc8cab9432ac5f8f",
      instagram: "69a97555dc8cab9432ba44e1",
      youtube: "69a2c219dc8cab9432ac5fae",
    },
  },
  {
    name: "Baby Patrick",
    apiKey: "",
    accounts: {
      tiktok: "69a2c39bdc8cab9432ac6303",
      instagram: "69a97281dc8cab9432ba3c9c",
      youtube: "69a2c3afdc8cab9432ac6342",
    },
  },
  {
    name: "Crazy Garfield",
    apiKey: "",
    accounts: {
      tiktok: "69a2c41adc8cab9432ac649a",
      instagram: "69a9733cdc8cab9432ba3ec1",
      youtube: "69a2c435dc8cab9432ac64fa",
    },
  },
  {
    name: "Garfield Tube",
    apiKey: "",
    accounts: {
      tiktok: "69a2c491dc8cab9432ac6602",
      instagram: "69a96f6cdc8cab9432ba35df",
      youtube: "69a2c4a4dc8cab9432ac6664",
    },
  },
  {
    name: "Gumball Free",
    apiKey: "",
    accounts: {
      tiktok: "69a2c537dc8cab9432ac682f",
      instagram: "69a96eb8dc8cab9432ba34b2",
      youtube: "69a2c54fdc8cab9432ac6879",
    },
  },
  {
    name: "Iam Macaroni",
    apiKey: "",
    accounts: {
      tiktok: "69a2c627dc8cab9432ac6aec",
      instagram: "69a96a1edc8cab9432ba2b76",
      youtube: "69a2c63ddc8cab9432ac6b1e",
    },
  },
  {
    name: "Meow Fox",
    apiKey: "",
    accounts: {
      tiktok: "69a26aedc8cab9432ac6c49",
      instagram: "69a9693fdc8cab9432ba278b",
      youtube: "69a2c6bcdc8cab9432ac6ca8",
    },
  },
  {
    name: "Mickey Mouse",
    apiKey: "",
    accounts: {
      tiktok: "69a2c775dc8cab9432ac6dff",
      instagram: "69a9642fdc8cab9432ba1b29",
      youtube: "69a2c795dc8cab9432ac6e55",
    },
  },
  {
    name: "Trumpet Pickle",
    apiKey: "",
    accounts: {
      tiktok: "69af549edc8cab9432c71ef9",
      instagram: "69a9675adc8cab9432ba2385",
      youtube: "69a96535dc8cab9432ba1ef9",
    },
  },
  {
    name: "Digistore 24",
    apiKey: "",
    accounts: {
      tiktok: "69a2c9abdc8cab9432ac7237",
      instagram: "69a2cab2dc8cab9432ac73bd",
      youtube: "69a2c9e8dc8cab9432ac7277",
    },
  },
  {
    name: "Amazon",
    apiKey: "",
    accounts: {
      tiktok: "69a2cd35dc8cab9432ac7805",
      instagram: "69ab3029dc8cab9432be1ef8",
      youtube: "69a2cd4bdc8cab9432ac783f",
    },
  },
  {
    name: "Sports",
    apiKey: "",
    accounts: {
      tiktok: "69a2cdf1dc8cab9432ac79d6",
      instagram: "69ab3279dc8cab9432be23c3",
      youtube: "69a2ce15dc8cab9432ac7a43",
    },
  },
  {
    name: "Cars",
    apiKey: "",
    accounts: {
      tiktok: "69a2ce83dc8cab9432ac7b94",
      instagram: "69ab33f9dc8cab9432be26de",
      youtube: "69a2ce9ddc8cab9432ac7bcf",
    },
  },
  {
    name: "Gadgets",
    apiKey: "",
    accounts: {
      tiktok: "69a2cf20dc8cab9432ac7cd7",
      instagram: "69ab3585dc8cab9432be299e",
      youtube: "69a2cf33dc8cab9432ac7cf6",
    },
  },
  {
    name: "Tec",
    apiKey: "",
    accounts: {
      tiktok: "69a2d028dc8cab9432ac7e6b",
      instagram: "69ab3690dc8cab9432be2b73",
      youtube: "69a2d046dc8cab9432ac7e9f",
    },
  },
  {
    name: "Beauty",
    apiKey: "",
    accounts: {
      tiktok: "69a2d0fddc8cab9432ac7ff7",
      instagram: "69ac056fdc8cab9432bfc8c8",
      youtube: "69a2d115dc8cab9432ac8029",
    },
  },
  {
    name: "Animals",
    apiKey: "",
    accounts: {
      tiktok: "69aec0a6dc8cab9432c599db",
      instagram: "69adf079dc8cab9432c3bd7c",
      youtube: "69a2d295dc8cab9432ac8482",
    },
  },
  {
    name: "Travel",
    apiKey: "",
    accounts: {
      tiktok: "69aebd09dc8cab9432c59128",
      instagram: "69adef9ddc8cab9432c3bb28",
      youtube: "69a2d411dc8cab9432ac89d0",
    },
  },
  {
    name: "Clothing",
    apiKey: "",
    accounts: {
      tiktok: "69aec00fdc8cab9432c597fc",
      instagram: "69adf217dc8cab9432c3c209",
      youtube: "69a2d484dc8cab9432ac8a84",
    },
  },
  {
    name: "Media",
    apiKey: "",
    accounts: {
      tiktok: "69aebf9adc8cab9432c596e1",
      instagram: "69adf3d7dc8cab9432c3c61c",
      youtube: "69a2d4e5dc8cab9432ac8b19",
    },
  },
];

async function main() {
  await prisma.batchPost.deleteMany();
  await prisma.uploadBatch.deleteMany();
  await prisma.scheduledPost.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.entity.deleteMany();

  for (const entry of DATA) {
    await prisma.entity.create({
      data: {
        name: entry.name,
        apiKey: entry.apiKey,
        accounts: {
          create: [
            {
              platform: "tiktok",
              handle: entry.name,
              externalAccountId: entry.accounts.tiktok,
            },
            {
              platform: "instagram",
              handle: entry.name,
              externalAccountId: entry.accounts.instagram,
            },
            {
              platform: "youtube",
              handle: entry.name,
              externalAccountId: entry.accounts.youtube,
            },
          ],
        },
      },
    });
  }
}

main().finally(() => prisma.$disconnect());