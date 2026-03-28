import "dotenv/config";
import Database from "better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const sqlite = new Database("dev.db", { readonly: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL fehlt in der .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type SqliteEntity = {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
};

type SqliteSocialAccount = {
  id: string;
  entityId: string;
  platform: string;
  handle: string;
  externalAccountId: string | null;
  createdAt: string;
  updatedAt: string;
};

type SqliteScheduledPost = {
  id: string;
  entityId: string;
  accountId: string | null;
  platform: string;
  title: string | null;
  caption: string;
  videoUrl: string;
  publicVideoUrl: string | null;
  videoFileName: string | null;
  scheduledAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type SqliteUploadBatch = {
  id: string;
  name: string;
  month: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
};

type SqliteBatchPost = {
  id: string;
  uploadBatchId: string;
  scheduledPostId: string;
  createdAt: string;
};

function toDate(value: string | null | undefined) {
  if (!value) return new Date();
  return new Date(value);
}

async function main() {
  console.log("Starte Import von SQLite -> Neon ...");

  const entities = sqlite
    .prepare(`SELECT id, name, apiKey, createdAt, updatedAt FROM "Entity"`)
    .all() as SqliteEntity[];

  const socialAccounts = sqlite
    .prepare(
      `SELECT id, entityId, platform, handle, externalAccountId, createdAt, updatedAt FROM "SocialAccount"`
    )
    .all() as SqliteSocialAccount[];

  const scheduledPosts = sqlite
    .prepare(
      `SELECT id, entityId, accountId, platform, title, caption, videoUrl, publicVideoUrl, videoFileName, scheduledAt, status, createdAt, updatedAt FROM "ScheduledPost"`
    )
    .all() as SqliteScheduledPost[];

  const uploadBatches = sqlite
    .prepare(
      `SELECT id, name, month, entityId, createdAt, updatedAt FROM "UploadBatch"`
    )
    .all() as SqliteUploadBatch[];

  const batchPosts = sqlite
    .prepare(
      `SELECT id, uploadBatchId, scheduledPostId, createdAt FROM "BatchPost"`
    )
    .all() as SqliteBatchPost[];

  console.log(`Entities: ${entities.length}`);
  console.log(`SocialAccounts: ${socialAccounts.length}`);
  console.log(`ScheduledPosts: ${scheduledPosts.length}`);
  console.log(`UploadBatches: ${uploadBatches.length}`);
  console.log(`BatchPosts: ${batchPosts.length}`);

  await prisma.batchPost.deleteMany();
  await prisma.uploadBatch.deleteMany();
  await prisma.scheduledPost.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.entity.deleteMany();

  for (const entity of entities) {
    await prisma.entity.create({
      data: {
        id: entity.id,
        name: entity.name,
        apiKey: entity.apiKey ?? "",
        createdAt: toDate(entity.createdAt),
        updatedAt: toDate(entity.updatedAt),
      },
    });
  }

  for (const account of socialAccounts) {
    await prisma.socialAccount.create({
      data: {
        id: account.id,
        entityId: account.entityId,
        platform: account.platform,
        handle: account.handle,
        externalAccountId: account.externalAccountId,
        createdAt: toDate(account.createdAt),
        updatedAt: toDate(account.updatedAt),
      },
    });
  }

  for (const post of scheduledPosts) {
    await prisma.scheduledPost.create({
      data: {
        id: post.id,
        entityId: post.entityId,
        accountId: post.accountId,
        platform: post.platform,
        title: post.title,
        caption: post.caption,
        videoUrl: post.videoUrl,
        publicVideoUrl: post.publicVideoUrl,
        videoFileName: post.videoFileName,
        scheduledAt: toDate(post.scheduledAt),
        status: post.status,
        createdAt: toDate(post.createdAt),
        updatedAt: toDate(post.updatedAt),
      },
    });
  }

  for (const batch of uploadBatches) {
    await prisma.uploadBatch.create({
      data: {
        id: batch.id,
        name: batch.name,
        month: batch.month,
        entityId: batch.entityId,
        createdAt: toDate(batch.createdAt),
        updatedAt: toDate(batch.updatedAt),
      },
    });
  }

  for (const batchPost of batchPosts) {
    await prisma.batchPost.create({
      data: {
        id: batchPost.id,
        uploadBatchId: batchPost.uploadBatchId,
        scheduledPostId: batchPost.scheduledPostId,
        createdAt: toDate(batchPost.createdAt),
      },
    });
  }

  console.log("Import erfolgreich abgeschlossen.");
}

main()
  .then(async () => {
    sqlite.close();
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Import fehlgeschlagen:", error);
    sqlite.close();
    await prisma.$disconnect();
    process.exit(1);
  });