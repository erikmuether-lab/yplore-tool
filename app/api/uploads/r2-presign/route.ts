import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getR2Config() {
  return {
    endpoint: process.env.R2_ENDPOINT?.trim() || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim() || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim() || "",
    bucketName: process.env.R2_BUCKET_NAME?.trim() || "",
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim() || "",
  };
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

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\-]+/g, "-");
}

export async function POST(request: Request) {
  try {
    const config = getR2Config();

    console.log("R2 presign route reached");
    console.log("R2 config check", {
      hasEndpoint: Boolean(config.endpoint),
      hasAccessKeyId: Boolean(config.accessKeyId),
      hasSecretAccessKey: Boolean(config.secretAccessKey),
      hasBucketName: Boolean(config.bucketName),
      hasPublicBaseUrl: Boolean(config.publicBaseUrl),
    });

    if (
      !config.endpoint ||
      !config.accessKeyId ||
      !config.secretAccessKey ||
      !config.bucketName ||
      !config.publicBaseUrl
    ) {
      return Response.json(
        { error: "R2-Konfiguration unvollständig." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const fileName = String(body.fileName ?? "").trim();
    const contentType = String(body.contentType ?? "").trim();

    console.log("R2 presign input", { fileName, contentType });

    if (!fileName || !contentType) {
      return Response.json(
        { error: "fileName und contentType sind erforderlich." },
        { status: 400 }
      );
    }

    const client = createR2Client();
    const safeFileName = `${Date.now()}-${sanitizeFileName(fileName)}`;
    const key = safeFileName;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 10,
    });

    const publicUrl = `${config.publicBaseUrl.replace(/\/+$/, "")}/${key}`;

    console.log("R2 presign success", { key, publicUrl });

    return Response.json({
      success: true,
      key,
      uploadUrl,
      publicUrl,
    });
  } catch (error) {
    console.error("R2 presign error", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unbekannter Fehler beim Signieren.",
      },
      { status: 500 }
    );
  }
}