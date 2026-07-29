import { prisma } from "@/server/db/prisma";
import { ensureSqliteSchema } from "@/server/db/ensure-sqlite-schema";

const MVP_USER_EMAIL = "owner@health-os.local";

export async function getCurrentUserId() {
  await ensureSqliteSchema();

  const user = await prisma.user.upsert({
    where: {
      email: MVP_USER_EMAIL
    },
    update: {},
    create: {
      email: MVP_USER_EMAIL,
      displayName: "Health OS Owner",
      timezone: "Asia/Tokyo",
      unitSystem: "metric"
    },
    select: {
      id: true
    }
  });

  return user.id;
}

export async function getCurrentUser() {
  await ensureSqliteSchema();

  return prisma.user.upsert({
    where: {
      email: MVP_USER_EMAIL
    },
    update: {},
    create: {
      email: MVP_USER_EMAIL,
      displayName: "Health OS Owner",
      timezone: "Asia/Tokyo",
      unitSystem: "metric"
    }
  });
}
