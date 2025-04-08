"use client";

import { toggleFollow } from "@/actions/user.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface UserCardProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    _count?: {
      followers: number;
    };
  };
  isFollowing?: boolean;
}

export default function UserCard({
  user,
  isFollowing: initialIsFollowing,
}: UserCardProps) {
  const currentUser = useUser().user;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentUser =
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  async function handleFollow() {
    if (isCurrentUser) return;

    setIsLoading(true);
    try {
      const result = await toggleFollow(user.id);
      if (result?.success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed" : "Following");
      } else {
        throw new Error(result?.error || "Failed to toggle follow");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3"
      >
        <Avatar>
          <AvatarImage src={user.image ?? "/avatar.png"} />
        </Avatar>
        <div>
          <p className="font-medium">{user.name || user.username}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user._count && (
            <p className="text-xs text-muted-foreground mt-1">
              {user._count.followers}{" "}
              {user._count.followers === 1 ? "follower" : "followers"}
            </p>
          )}
        </div>
      </Link>

      {!isCurrentUser ? (
        currentUser ? (
          <Button
            onClick={handleFollow}
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            className={cn(
              isFollowing &&
                "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            )}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
          </Button>
        ) : (
          <SignInButton mode="modal">
            <Button size="sm" variant="default">
              Follow
            </Button>
          </SignInButton>
        )
      ) : (
        <Link href={`/profile/${user.username}`}>
          <Button size="sm" variant="outline">
            Your Profile
          </Button>
        </Link>
      )}
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  );
}
