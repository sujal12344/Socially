"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    // if user already exists, return it
    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}
