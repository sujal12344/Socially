"use client";

import { toggleFollow } from "@/actions/user.action";
import { 
  acceptFriendRequest, 
  checkFriendshipStatus, 
  toggleFriendRequest 
} from "@/actions/friendRequest.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { formatUrlForDisplay } from "@/lib/utils";
import {
  CalendarIcon,
  LinkIcon,
  MapPinIcon,
  MessageCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCheckIcon,
} from "lucide-react";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfileHeader({ username }: { username: string }) {
  const { user: currentUser, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<
    "none" | "pending" | "received" | "friends"
  >("none");
  const [isUpdatingFriendRequest, setIsUpdatingFriendRequest] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile?username=${username}`);
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setProfile(data.user);
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [username]);

  // Check friendship status on component mount
  useEffect(() => {
    const checkFriendship = async () => {
      if (!profile || !currentUser || isCurrentUser()) return;
      
      try {
        const result = await checkFriendshipStatus(profile.id);
        if (!result) {
          setFriendStatus("none");
          return;
        }
        
        const status = result.status;
        if (
          status === "none" ||
          status === "pending" ||
          status === "received" ||
          status === "friends"
        ) {
          setFriendStatus(status);
        } else {
          setFriendStatus("none");
        }
      } catch (error) {
        console.error("Failed to check friendship status:", error);
      }
    };
    
    checkFriendship();
  }, [profile, currentUser]);

  async function handleToggleFollow() {
    if (!profile) return;

    setIsFollowLoading(true);
    try {
      const result = await toggleFollow(profile.id);
      if (result?.success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed" : "Following");
      } else {
        throw new Error(result?.error || "Failed to toggle follow");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsFollowLoading(false);
    }
  }

  async function handleFriendRequest() {
    if (!profile || !currentUser) return;
    
    setIsUpdatingFriendRequest(true);
    try {
      switch (friendStatus) {
        case "none":
          // Send new friend request
          const sendResult = await toggleFriendRequest(profile.id);
          if (sendResult?.success) {
            setFriendStatus("pending");
            toast.success("Friend request sent");
          }
          break;
          
        case "pending":
          // Cancel existing request
          const cancelResult = await toggleFriendRequest(profile.id);
          if (cancelResult?.success) {
            setFriendStatus("none");
            toast.success("Friend request cancelled");
          }
          break;
          
        case "received":
          // Accept incoming request
          const acceptResult = await acceptFriendRequest(profile.id);
          if (acceptResult?.success) {
            setFriendStatus("friends");
            toast.success("Friend request accepted");
          }
          break;
        case "friends":
          // Already friends - could implement unfriend functionality here
          toast.success("You are already friends");
          break;
  
        default:
          toast.error("Unknown friendship status");
      }
    } catch (error) {
      console.error("Friend request error:", error);
      toast.error("Failed to update friend request");
    } finally {
      setIsUpdatingFriendRequest(false);
    }
  }
  
  function isCurrentUser() {
    return currentUser?.emailAddresses[0].emailAddress.split("@")[0] === username;
  }

  function renderFriendshipButton() {
    const buttonConfig = {
      friends: {
        component: (
          <Button asChild variant="outline">
            <Link href={`/chat/${profile.username}`}>
              <MessageCircleIcon className="mr-2 h-4 w-4" />
              Message
            </Link>
          </Button>
        )
      },
      pending: {
        component: (
          <Button 
            variant="outline"
            onClick={handleFriendRequest}
            disabled={isUpdatingFriendRequest}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <UserMinusIcon className="mr-2 h-4 w-4" />
            Cancel Request
          </Button>
        )
      },
      received: {
        component: (
          <Button 
            variant="default"
            onClick={handleFriendRequest}
            disabled={isUpdatingFriendRequest}
          >
            <UserCheckIcon className="mr-2 h-4 w-4" />
            Accept Request
          </Button>
        )
      },
      none: {
        component: (
          <Button 
            variant="outline"
            onClick={handleFriendRequest}
            disabled={isUpdatingFriendRequest}
          >
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        )
      }
    };
    
    return buttonConfig[friendStatus].component;
  }

  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">User not found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent md:bg-card">
      <CardContent className="p-0 md:p-6">
        {/* Profile avatar and content */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          <Avatar className="w-20 h-20 md:w-24 md:h-24">
            <AvatarImage
              src={profile.image ?? "/avatar.png"}
              alt={profile.name || profile.username}
            />
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.name || profile.username}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              {isLoaded &&
                !isCurrentUser() &&
                (currentUser ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleToggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={cn(
                        isFollowing &&
                          "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      )}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading
                        ? "Loading..."
                        : isFollowing
                        ? "Following"
                        : "Follow"}
                    </Button>

                    {renderFriendshipButton()}
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="sm" variant="default">
                      Follow
                    </Button>
                  </SignInButton>
                ))}
            </div>

            {profile.bio && (
              <p className="text-sm md:text-base">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="size-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="size-4" />
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    {formatUrlForDisplay
                      ? formatUrlForDisplay(profile.website)
                      : profile.website}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-1">
                <CalendarIcon className="size-4" />
                <span>
                  Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <Card className="border-0 shadow-none bg-transparent md:bg-card">
      <CardContent className="p-0 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full" />

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
