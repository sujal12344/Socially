import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function sendFriendRequest(receiverId: string, message?: string) {
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
      return { error: "Friend request already sent" };
    }

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
  } catch (error) {
    console.error("Error sending friend request:", error);
    return null;
  }
}

export async function acceptFriendRequest(requestId: string, message?: string) {
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
      return { error: "You are not authorized to accept this request" };
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: {
          id: requestId,
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
    if (!userId) return null;

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

    return friendRequest;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return null;
  }
}

export async function getOutGoingFriendRequest() {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

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

    return friendRequest;
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    return null;
  }
}
