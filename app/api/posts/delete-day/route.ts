import { prisma } from "@/src/lib/prisma";

function parseDateParts(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    Number.isNaN(day) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, monthIndex, day };
}

function getBerlinDateParts(dateInput: string | Date) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
    monthIndex:
      Number(parts.find((part) => part.type === "month")?.value ?? "01") - 1,
    day: Number(parts.find((part) => part.type === "day")?.value ?? "01"),
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const entityId = String(formData.get("entityId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  const parsedDate = parseDateParts(date);

  if (!entityId || !parsedDate) {
    return Response.json(
      { error: "entityId oder date fehlt bzw. ist ungültig." },
      { status: 400 }
    );
  }

  const posts = await prisma.scheduledPost.findMany({
    where: {
      entityId,
    },
    select: {
      id: true,
      scheduledAt: true,
    },
  });

  const idsToDelete = posts
    .filter((post) => {
      const parts = getBerlinDateParts(post.scheduledAt);

      return (
        parts.year === parsedDate.year &&
        parts.monthIndex === parsedDate.monthIndex &&
        parts.day === parsedDate.day
      );
    })
    .map((post) => post.id);

  if (idsToDelete.length > 0) {
    await prisma.scheduledPost.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });
  }

  const redirectUrl = returnTo
    ? new URL(returnTo, request.url)
    : new URL("/", request.url);

  return Response.redirect(redirectUrl, 303);
}