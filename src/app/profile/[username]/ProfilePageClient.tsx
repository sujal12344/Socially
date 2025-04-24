"use client";

import {
  getProfileByUsername,
  getUserPosts,
  updateProfile,
} from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import {
  acceptFriendRequest,
  checkFriendshipStatus,
  toggleFriendRequest,
} from "@/actions/friendRequest.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  UserPlusIcon,
  UserMinusIcon,
  MessageSquareIcon,
  UserCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

export default function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [friendStatus, setFriendStatus] = useState<
    "none" | "pending" | "received" | "friends"
  >("none");
  const [isUpdatingFriendRequest, setIsUpdatingFriendRequest] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleFriendRequest = async () => {
    if (!currentUser) return;

    setIsUpdatingFriendRequest(true);

    try {
      switch (friendStatus) {
        case "none":
          // Send new friend request
          const sendResult = await toggleFriendRequest(user.id);
          if (sendResult?.success) {
            setFriendStatus("pending");
            toast.success("Friend request sent");
          }
          break;

        case "pending":
          // Cancel existing request
          const cancelResult = await toggleFriendRequest(user.id);
          if (cancelResult?.success) {
            setFriendStatus("none");
            toast.success("Friend request cancelled");
          }
          break;

        case "received":
          // Accept incoming request
          const acceptResult = await acceptFriendRequest(user.id);
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
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  useEffect(() => {
    const checkFriendship = async () => {
      if (!currentUser || isOwnProfile) return;

      try {
        const result = await checkFriendshipStatus(user.id);
        if (!result) {
          setFriendStatus("none");
          return;
        }

        // Add type validation before setting state
        const status = result.status;
        if (
          status === "none" ||
          status === "pending" ||
          status === "received" ||
          status === "friends"
        ) {
          setFriendStatus(status);
        } else {
          // Default to "none" if unexpected status received
          setFriendStatus("none");
          console.error("Unexpected friendship status:", status);
        }
      } catch (error) {
        console.error("Failed to check friendship status:", error);
      }
    };

    checkFriendship();
  }, [currentUser, isOwnProfile, user.id]);

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  const renderProfileActions = () => {
    if (!currentUser) {
      return (
        <SignInButton mode="modal">
          <Button className="w-full mt-4">Follow</Button>
        </SignInButton>
      );
    }

    if (isOwnProfile) {
      return (
        <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
          <EditIcon className="size-4 mr-2" />
          Edit Profile
        </Button>
      );
    }

    return (
      <div className="w-full mt-4 grid grid-cols-2 gap-2">
        <Button
          onClick={handleFollow}
          disabled={isUpdatingFollow}
          variant={isFollowing ? "outline" : "default"}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>

        {renderFriendshipButton()}
      </div>
    );
  };

  const renderFriendshipButton = () => {
    const buttonConfig = {
      friends: {
        variant: "secondary" as const,
        icon: <MessageSquareIcon className="size-4 mr-2" />,
        label: "Message",
        onClick: () => router.push(`/chat/${user.username}`),
        disabled: false,
      },
      pending: {
        variant: "outline" as const,
        icon: <UserMinusIcon className="size-4 mr-2" />,
        label: "Cancel Request",
        onClick: handleFriendRequest,
        disabled: isUpdatingFriendRequest,
      },
      received: {
        variant: "default" as const,
        icon: <UserCheckIcon className="size-4 mr-2" />,
        label: "Accept Request",
        onClick: handleFriendRequest,
        disabled: isUpdatingFriendRequest,
      },
      none: {
        variant: "secondary" as const,
        icon: <UserPlusIcon className="size-4 mr-2" />,
        label: "Add Friend",
        onClick: handleFriendRequest,
        disabled: isUpdatingFriendRequest,
      },
    };

    const config = buttonConfig[friendStatus];

    return (
      <Button
        variant={config.variant}
        onClick={config.onClick}
        disabled={config.disabled}
      >
        {config.icon}
        {config.label}
      </Button>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.username}
                </h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <Link href={`/profile/${user.username}/followings`}>
                      <div className="font-semibold">
                        {user._count.following.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Following
                      </div>
                    </Link>
                    <Separator orientation="vertical" />
                    <Link href={`/profile/${user.username}/followers`}>
                      <div className="font-semibold">
                        {user._count.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Followers
                      </div>
                    </Link>
                    <Separator orientation="vertical" />
                    <Link href={`/profile/${user.username}/posts`}>
                      <div className="font-semibold">
                        {user._count.posts.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </Link>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                {renderProfileActions()}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold w-full"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold w-full"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No liked posts to show
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  placeholder="Your personal website"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
