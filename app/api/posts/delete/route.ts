import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

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