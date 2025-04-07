"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";
import { cn } from "@/lib/utils";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
      toast.success("User followed successfully");
    } catch (error) {
      toast.error("Error following user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      className={cn(
        "transition-all duration-300 hover:opacity-70",
        isFollowing &&
          "hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
        isLoading && "opacity-70"
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {isFollowing ? "Unfollowing..." : "Following..."}
        </span>
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}
export default FollowButton;
