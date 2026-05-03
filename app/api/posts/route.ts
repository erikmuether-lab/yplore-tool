import { prisma } from "@/src/lib/prisma";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

function getR2Config() {
  return {
    endpoint: process.env.R2_ENDPOINT?.trim() || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim() || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim() || "",
    bucketName: process.env.R2_BUCKET_NAME?.trim() || "",
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim() || "",
  };
}

function canUploadToR2() {
  const config = getR2Config();

  return Boolean(
    config.endpoint &&
      config.accessKeyId &&
      config.secretAccessKey &&
      config.bucketName &&
      config.publicBaseUrl
  );
}

function createR2Client() {
  const config = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function buildPublicFileUrl(fileName: string) {
  const { publicBaseUrl } = getR2Config();
  return `${publicBaseUrl.replace(/\/+$/, "")}/${fileName}`;
}

function normalizePlatforms(input: unknown) {
  const values = Array.isArray(input) ? input : [input];

  return values
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

export async function GET() {
  const posts = await prisma.scheduledPost.findMany({
    orderBy: { scheduledAt: "asc" },
    include: {
      entity: true,
      account: true,
    },
    take: 500,
  });

  return Response.json(posts);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const entityId = String(formData.get("entityId") ?? "").trim();
      const platforms = normalizePlatforms(formData.getAll("platforms"));
      const title = String(formData.get("title") ?? "").trim();
      const caption = String(formData.get("caption") ?? "").trim();
      const date = String(formData.get("date") ?? "").trim();
      const time = String(formData.get("time") ?? "").trim();
      const publicVideoUrlInput = String(formData.get("publicVideoUrl") ?? "").trim();
      const file = formData.get("videoFile");

      if (!entityId || platforms.length === 0 || !caption || !date || !time) {
        return Response.json(
          {
            error:
              "entityId, mindestens eine Plattform, caption, date und time sind erforderlich.",
          },
          { status: 400 }
        );
      }

      const entity = await prisma.entity.findUnique({
        where: { id: entityId },
        include: { accounts: true },
      });

      if (!entity) {
        return Response.json({ error: "Einheit nicht gefunden." }, { status: 404 });
      }

      let safeFileName = "";
      let videoUrl = publicVideoUrlInput;
      let publicVideoUrl: string | null = publicVideoUrlInput || null;

      if (file instanceof File && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), "uploads");
        await mkdir(uploadsDir, { recursive: true });

        safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = path.join(uploadsDir, safeFileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

        videoUrl = `/uploads/${safeFileName}`;

        if (!publicVideoUrl && canUploadToR2()) {
          try {
            const r2 = createR2Client();
            const { bucketName } = getR2Config();

            await r2.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: safeFileName,
                Body: buffer,
                ContentType: file.type || "video/mp4",
              })
            );

            publicVideoUrl = buildPublicFileUrl(safeFileName);
          } catch (error) {
            console.error("R2 upload fehlgeschlagen:", error);
            publicVideoUrl = null;
          }
        }
      }

      if (!publicVideoUrl && !videoUrl) {
        return Response.json(
          {
            error:
              "Bitte entweder eine Video-Datei hochladen oder eine öffentliche Video-URL eintragen.",
          },
          { status: 400 }
        );
      }

      const scheduledAt = new Date(`${date}T${time}:00`);

      const posts = await prisma.$transaction(
        platforms.map((platform) => {
          const account =
            entity.accounts.find((account) => account.platform === platform) ?? null;

          return prisma.scheduledPost.create({
            data: {
              entityId,
              accountId: account?.id ?? null,
              platform,
              title: title || null,
              caption,
              videoUrl: videoUrl || publicVideoUrl || "",
              publicVideoUrl,
              videoFileName:
                file instanceof File && file.size > 0 ? file.name : null,
              scheduledAt,
              status: "planned",
            },
          });
        })
      );

      return Response.json(
        {
          success: true,
          createdCount: posts.length,
          posts,
        },
        { status: 201 }
      );
    }

    const body = await request.json();

    const entityId = String(body.entityId ?? "").trim();
    const platforms = normalizePlatforms(body.platforms ?? body.platform);
    const title = String(body.title ?? "").trim();
    const caption = String(body.caption ?? "").trim();
    const videoUrl = String(body.videoUrl ?? "").trim();
    const publicVideoUrl = String(body.publicVideoUrl ?? "").trim();
    const videoFileName = String(body.videoFileName ?? "").trim();
    const scheduledAt = String(body.scheduledAt ?? "").trim();

    if (!entityId || platforms.length === 0 || !caption || !videoUrl || !scheduledAt) {
      return Response.json(
        {
          error:
            "entityId, mindestens eine Plattform, caption, videoUrl und scheduledAt sind erforderlich.",
        },
        { status: 400 }
      );
    }

    const entity = await prisma.entity.findUnique({
      where: { id: entityId },
      include: { accounts: true },
    });

    if (!entity) {
      return Response.json({ error: "Einheit nicht gefunden." }, { status: 404 });
    }

    const posts = await prisma.$transaction(
      platforms.map((platform) => {
        const account =
          entity.accounts.find((account) => account.platform === platform) ?? null;

        return prisma.scheduledPost.create({
          data: {
            entityId,
            accountId: account?.id ?? null,
            platform,
            title: title || null,
            caption,
            videoUrl,
            publicVideoUrl: publicVideoUrl || null,
            videoFileName: videoFileName || null,
            scheduledAt: new Date(scheduledAt),
            status: "planned",
          },
          include: {
            entity: true,
            account: true,
          },
        });
      })
    );

    return Response.json(
      {
        success: true,
        createdCount: posts.length,
        posts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts Fehler:", error);

    return Response.json(
      { error: error instanceof Error ? error.message : "Unbekannter Fehler." },
      { status: 500 }
    );
  }
}