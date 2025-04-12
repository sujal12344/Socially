"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isFollowing } from "./profile.action";

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

    // Get all users and fetch their isFollowing status in parallel
    const followersWithStatus = await Promise.all(
      followers.map(async (follow) => {
        const isFollowingStatus = await isFollowing(follow.following.id);
        return {
          ...follow.following,
          isFollowing: isFollowingStatus,
        };
      })
    );

    revalidatePath(`/profile/${username}/followers`);
    return followersWithStatus;
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

    // Get all users and fetch their isFollowing status in parallel
    const followingWithStatus = await Promise.all(
      following.map(async (follow) => {
        const isFollowingStatus = await isFollowing(follow.follower.id);
        return {
          ...follow.follower,
          isFollowing: isFollowingStatus,
        };
      })
    );

    revalidatePath(`/profile/${username}/followings`);
    return followingWithStatus;
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

  revalidatePath("/");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      // return popular users if user is not logged in, so it can interest new users to sign up
      const popularUsers = await prisma.user.findMany({
        orderBy: {
          followers: {
            _count: "desc",
          },
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
        take: 3,
      });
      revalidatePath("/");
      return popularUsers;
    }

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } }, // means do not include ourselves
          {
            NOT: {
              followers: {
                some: {
                  followingId: userId, // means do not include users that I already follow
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
      orderBy: {
        followers: {
          _count: "desc",
        },
      },
      take: 3,
    });

    revalidatePath("/");

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
          followerId: targetUserId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        // delete the follow if already follow and again click for unfollow
        where: {
          followerId_followingId: {
            followerId: targetUserId,
            followingId: userId,
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
            followerId: targetUserId,
            followingId: userId, //kisne
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
          followerId: targetUserDBId,
          followingId: currentUserDBId,
        },
      },
    });

    revalidatePath("/");

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
