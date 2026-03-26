-- CreateTable
CREATE TABLE "BatchPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadBatchId" TEXT NOT NULL,
    "scheduledPostId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BatchPost_uploadBatchId_fkey" FOREIGN KEY ("uploadBatchId") REFERENCES "UploadBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BatchPost_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
