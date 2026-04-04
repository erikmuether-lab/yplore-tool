import { prisma } from "@/src/lib/prisma";

function parseMonthValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return null;
  }

  return { year, monthIndex };
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
  const month = String(formData.get("month") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  const parsedMonth = parseMonthValue(month);

  if (!entityId || !parsedMonth) {
    return Response.json(
      { error: "entityId oder month fehlt bzw. ist ungültig." },
      { status: 400 }
    );
  }

  const posts = await prisma.scheduledPost.findMany({
    where: {
      entityId,
      status: "planned",
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
        parts.year === parsedMonth.year &&
        parts.monthIndex === parsedMonth.monthIndex
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