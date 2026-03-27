import { PrismaClient } from "@/src/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const entities = await prisma.entity.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      accounts: {
        orderBy: {
          createdAt: "asc",
        },
      },
      posts: {
  orderBy: {
    scheduledAt: "asc",
  },
},
    },
  });

  return Response.json(entities);
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const apiKey = String(body.apiKey ?? "").trim();

  if (!name || !apiKey) {
    return Response.json(
      { error: "Name und API Key sind erforderlich." },
      { status: 400 }
    );
  }

  const entity = await prisma.entity.create({
    data: {
      name,
      apiKey,
    },
  });

  return Response.json(entity, { status: 201 });
}