import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();

  const singleId = String(formData.get("id") ?? "").trim();
  const ids = formData
    .getAll("ids")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  const returnTo = String(formData.get("returnTo") ?? "").trim();
  const postIds = singleId ? [singleId] : ids;

  if (postIds.length === 0) {
    return Response.json({ error: "Post-ID fehlt." }, { status: 400 });
  }

  await prisma.scheduledPost.deleteMany({
    where: {
      id: {
        in: postIds,
      },
    },
  });

  const redirectUrl = returnTo
    ? new URL(returnTo, request.url)
    : new URL("/", request.url);

  return Response.redirect(redirectUrl, 303);
}