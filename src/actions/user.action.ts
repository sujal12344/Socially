"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
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

    return user;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return null;
  }
}

export async function getUserFollowers(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return null;

    const followers = await prisma.follows.findMany({
      where: { followingId: user.id },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
      },
    });

    return followers.map((follow) => follow.follower);
  } catch (error) {
    console.error("Error fetching user followers:", error);
    return null;
  }
}

export async function getUserFollowings(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return null;

    const following = await prisma.follows.findMany({
      where: { followerId: user.id },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
      },
    });

    // const currentUserDBId = await getDbUserId();
    // if (!currentUserDBId) return null; // user not logged in

    // const follow = await prisma.follows.findUnique({
    //   where: {
    //     followerId_followingId: {
    //       followerId: currentUserDBId,
    //       followingId: user.id,
    //     },
    //   },
    // });

    return following.map((follow) => follow.following);
  } catch (error) {
    console.error("Error fetching user following:", error);
    return null;
  }
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } }, // means do not include ourselves
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId, // means do not include users that I already follow
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      // orderBy: {
      //   followers: {
      //     _count: "asc",
      //   },
      // },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        // delete the follow if already follow and again click for unfollow
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow and create the follow and notification in a transaction
      await prisma.$transaction([
        // transaction to ensure both operations are done or none (I mean ya to dono hoga ya fir koi nahi)
        // create follow
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        // create notification
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}

export async function isFollowedTargetUser(targetUserDBId: string) {
  try {
    const currentUserDBId = await getDbUserId();

    if (!targetUserDBId) return false;
    if (!currentUserDBId) return false; // user not logged in

    if (currentUserDBId === targetUserDBId) return false; // you cannot follow yourself

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserDBId,
          followingId: targetUserDBId,
        },
      },
    });
    console.log("follow", follow);
    console.log("follow", !!follow);

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
