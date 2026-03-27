import { PrismaClient } from "@/src/generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return Response.json({ error: "Post-ID fehlt." }, { status: 400 });
  }

  await prisma.scheduledPost.delete({
    where: { id },
  });

  return Response.redirect(new URL("/", request.url), 303);
}