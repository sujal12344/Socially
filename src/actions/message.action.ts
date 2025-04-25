"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { getUserByUsername } from "./user.action";

// Get all conversations for the current user
export async function getConversations() {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    // Find all conversations where user is either sender or receiver
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderUserId: userId }, { receiverUserId: userId }],
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["senderUserId", "receiverUserId"],
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Group and format conversations by other user
    const formattedConversations = conversations.map((message) => {
      const otherUser =
        message.senderUserId === userId ? message.receiver : message.sender;

      return {
        id: `${userId}-${otherUser.id}`,
        otherUser,
        lastMessage: {
          content: message.content,
          createdAt: message.createdAt,
          read: message.read,
          fromMe: message.senderUserId === userId,
        },
      };
    });

    // Remove duplicates based on otherUser.id
    const uniqueConversations = Array.from(
      new Map(formattedConversations.map((item) => [item.otherUser.id, item]))
    ).map(([, item]) => item);

    // revalidatePath("/chat");
    return uniqueConversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return null;
  }
}

// Get messages between current user and another user
export async function getMessages(username: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const otherUser = await getUserByUsername(username);
    if (!otherUser) return null;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderUserId: userId,
            receiverUserId: otherUser.id,
          },
          {
            senderUserId: otherUser.id,
            receiverUserId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
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
    });

    // Mark unread messages as read
    const unreadMessages = messages.filter(
      (message) => !message.read && message.receiverUserId === userId
    );

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessages.map((message) => message.id),
          },
        },
        data: {
          read: true,
        },
      });
    }

    // revalidatePath(`/chat/${username}`);
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return null;
  }
}

// Send a message to another user
export async function sendMessage(receiverUsername: string, content: string) {
  try {
    const senderId = await getDbUserId();
    if (!senderId) return { success: false, error: "Not authenticated" };
    if (!content.trim())
      return { success: false, error: "Message cannot be empty" };

    const receiver = await getUserByUsername(receiverUsername);
    if (!receiver) return { success: false, error: "Recipient not found" };

    const message = await prisma.$transaction(async (tx) => {
      // Create the message
      const message = await prisma.message.create({
        data: {
          senderUserId: senderId,
          receiverUserId: receiver.id,
          content: content.trim(),
          read: false,
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
      });

      //create notification for the receiver
      await tx.notification.create({
        data: {
          type: "MESSAGE",
          userId: receiver.id,
          creatorId: senderId,
          messageId: message.id,
          content: content.trim(),
        },
      });

      // Update the last message in the conversation
      // await tx.message.updateMany({
      //   where: {
      //     OR: [
      //       {
      //         senderUserId: senderId,
      //         receiverUserId: receiver.id,
      //       },
      //       {
      //         senderUserId: receiver.id,
      //         receiverUserId: senderId,
      //       },
      //     ],
      //   },
      //   data: {
      //     content: content.trim(),
      //     read: false,
      //   },
      // });
      // revalidatePath("/chat");

      return message;
    });
    // revalidatePath(`/chat/${receiverUsername}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

// Get count of unread messages for the current user
export async function getUnreadMessageCount() {
  try {
    const userId = await getDbUserId();
    if (!userId) return 0;

    const count = await prisma.message.count({
      where: {
        receiverUserId: userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}
