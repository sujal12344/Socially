"use client";

import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  HeartIcon,
  MessageCircleIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  Twitter,
} from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

const getNotificationMessage = (notification: Notification) => {
  const { type, friendRequest } = notification;

  switch (type) {
    case "FOLLOW":
      return "started following you";
    case "LIKE":
      return "liked your post";
    case "COMMENT":
      return "commented on your post";
    case "MESSAGE":
      return "sent you a message";
    case "POST":
      return "posted a new tweet";
    case "FRIEND_REQUEST":
      if (!friendRequest) return "sent you a friend request";
      else if (friendRequest.status === "ACCEPTED") {
        return "accepted your friend request";
      } else if (friendRequest.status === "REJECTED") {
        return "rejected your friend request";
      }
  }
};

const getNotificationIcon = (notification: Notification) => {
  const { type, friendRequest } = notification;

  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-4 text-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-green-500" />;
    case "MESSAGE":
      return <MessageCircleIcon className="size-4 text-purple-500" />;
    case "POST":
      return <Twitter className="size-4 text-blue-500" />;
    case "FRIEND_REQUEST":
      if (!friendRequest)
        return <UserPlusIcon className="size-4 text-yellow-500" />;
      else if (friendRequest.status === "ACCEPTED") {
        return <CheckCircleIcon className="size-4 text-green-500" />;
      } else if (friendRequest.status === "REJECTED") {
        return <XCircleIcon className="size-4 text-red-500" />;
      }
  }
};

const getNotificationLink = (notification: Notification) => {
  const { type, creator } = notification;
  const { username } = creator;
  switch (type) {
    case "LIKE":
      return "/";
    case "COMMENT":
      return "/";
    case "FOLLOW":
      return `/profile/${username}`;
    case "MESSAGE":
      return `/chat/${username}`;
    case "POST":
      return "/";
    case "FRIEND_REQUEST":
      return `/profile/${username}`;
  }
};

const NotificationContent = ({
  notification,
}: {
  notification: Notification;
}) => {
  return (
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        {getNotificationIcon(notification)}
        <span>
          <Link href={`/profile/${notification.creator.username}`}>
            <span className="font-medium hover:underline">
              {notification.creator.name ?? notification.creator.username}
            </span>{" "}
          </Link>
          {getNotificationMessage(notification)}
        </span>
      </div>

      {notification.post &&
        (notification.type === "LIKE" || notification.type === "COMMENT") && (
          <div className="pl-6 space-y-2">
            <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
              <p>{notification.post.content}</p>
              {notification.post.image && (
                <img
                  src={notification.post.image}
                  alt="Post content"
                  className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                />
              )}
            </div>

            {notification.type === "COMMENT" && notification.comment && (
              <div className="text-sm p-2 bg-accent/50 rounded-md">
                {notification.comment.content}
              </div>
            )}
          </div>
        )}

      <p className="text-sm text-muted-foreground pl-6">
        {formatDistanceToNow(new Date(notification.createdAt), {
          addSuffix: true,
        })}
      </p>
    </div>
  );
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);

        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);
      } catch (error) {
        toast.error("Failed to fetch notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} unread
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  href={getNotificationLink(notification)}
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <Link href={`/profile/${notification.creator.username}`}>
                    <Avatar className="mt-1">
                      <AvatarImage
                        src={notification.creator.image ?? "/avatar.png"}
                      />
                    </Avatar>
                  </Link>

                  <NotificationContent notification={notification} />
                </Link>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
export default NotificationsPage;
