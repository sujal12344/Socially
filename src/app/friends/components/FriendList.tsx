"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFriendList } from "@/actions/friendRequest.action";

export default function FriendList() {
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFriends = async () => {
      setIsLoading(true);
      try {
        const response = await getFriendList();
        setFriends(response || []);
      } catch (error) {
        console.error("Failed to load friends", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, []);

  if (isLoading) {
    return <div className="py-4 text-center">Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground mb-4">
          You don't have any friends yet.
        </p>
        <Button asChild>
          <Link href="/explore">Find Friends</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between py-4 px-6"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={friend.image || "/avatar.png"} />
            </Avatar>
            <div>
              <p className="font-medium">{friend.name || friend.username}</p>
              <p className="text-sm text-muted-foreground">
                @{friend.username}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => router.push(`/profile/${friend.username}`)}
            >
              Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/chat/${friend.username}`)}
            >
              <MessageSquareIcon className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
