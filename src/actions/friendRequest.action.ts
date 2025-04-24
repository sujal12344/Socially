"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function toggleFriendRequest(
  receiverId: string,
  message?: string
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: userId,
        receiverId,
      },
    });

    if (existingRequest) {
      await prisma.$transaction([
        prisma.friendRequest.delete({
          where: {
            id: existingRequest.id,
          },
        }),
        prisma.notification.deleteMany({
          where: {
            type: "FRIEND_REQUEST",
            userId: receiverId,
            creatorId: userId,
          },
        }),
      ]);
      return { success: true, message: "Friend request removed" };
    } else {
      await prisma.$transaction([
        prisma.friendRequest.create({
          data: {
            senderId: userId,
            receiverId,
            reqMsg: message || null,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FRIEND_REQUEST",
            userId: receiverId,
            creatorId: userId,
          },
        }),
      ]);
      return { success: true, message: "Friend request sent" };
    }
  } catch (error) {
    console.error("Error sending friend request:", error);
    return null;
  }
}

export async function acceptFriendRequest(senderId: string, message?: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: userId,
        },
      },
    });

    if (!friendRequest) {
      return { error: "Friend request not found" };
    }

    if (friendRequest.receiverId !== userId) {
      return { error: "You are not authorized to accept this request" };
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: {
          senderId_receiverId: {
            senderId,
            receiverId: userId,
          },
        },
        data: {
          status: "ACCEPTED",
          resMesg: message || null,
        },
      }),
      prisma.notification.create({
        data: {
          type: "FRIEND_REQUEST",
          userId: friendRequest.senderId,
          creatorId: userId,
        },
      }),
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          friendList: {
            connect: { id: friendRequest.senderId },
          },
        },
      }),
      prisma.user.update({
        where: {
          id: friendRequest.senderId,
        },
        data: {
          friendList: {
            connect: { id: userId },
          },
        },
      }),
    ]);

    return { success: true, message: "Friend request accepted" };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return null;
  }
}

export async function rejectFriendRequest(requestId: string, message?: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: {
        id: requestId, // Assuming requestId is unique
      },
    });

    if (!friendRequest) {
      return { error: "Friend request not found" };
    }

    if (friendRequest.receiverId !== userId) {
      return { error: "You are not authorized to reject this request" };
    }

    await prisma.friendRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "REJECTED",
        resMesg: message || null,
      },
    });

    return { success: true, message: "Friend request rejected" };
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return null;
  }
}

export async function getIncomingFriendRequest() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const friendRequest = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!friendRequest || friendRequest.length === 0) {
      return [];
    }

    return friendRequest;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return [];
  }
}

export async function getOutGoingFriendRequest() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const friendRequest = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!friendRequest || friendRequest.length === 0) {
      return [];
    }

    return friendRequest;
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    return [];
  }
}

export async function checkFriendshipStatus(friendId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return { status: "none", error: "User not found" };

    // Check if they're friends
    const areFriends = await prisma.user.findFirst({
      where: {
        id: currentUserId,
        friendList: {
          some: {
            id: friendId,
          },
        },
      },
    });
    if (areFriends) {
      return { status: "friends", message: "You are friends" };
    }

    // Check pending requests
    const pendingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: currentUserId,
        receiverId: friendId,
        status: "PENDING",
      },
    });
    if (pendingRequest) {
      return { status: "pending", message: "Friend request is pending" };
    }

    const pendingRequestReceived = await prisma.friendRequest.findFirst({
      where: {
        senderId: friendId,
        receiverId: currentUserId,
        status: "PENDING",
      },
    });
    if (pendingRequestReceived) {
      return { status: "received", message: "Friend request received" };
    }

    return { status: "none", message: "No friendship status found" };
  } catch (error) {
    console.error("Error checking friendship status:", error);
    return { status: "none", error: "Failed to check friendship status" };
  }
}

export async function getFriendList() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const friendList = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        friendList: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    if (!friendList || friendList.friendList.length === 0) {
      return [];
    }

    return friendList.friendList;
  } catch (error) {
    console.error("Error fetching friend list:", error);
    return [];
  }
}
