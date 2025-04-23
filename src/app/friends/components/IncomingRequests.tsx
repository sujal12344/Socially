"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/actions/friendRequest.action";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function IncomingRequests({
  requests = [],
}: {
  requests: any[];
}) {
  const router = useRouter();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  if (!requests.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          You don't have any friend requests.
        </p>
      </div>
    );
  }

  const handleAccept = async (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      const result = await acceptFriendRequest(userId);
      if (result?.success) {
        toast.success("Friend request accepted");
        router.refresh();
      } else {
        throw new Error(result?.error || "Failed to accept request");
      }
    } catch (error) {
      toast.error("Failed to accept request");
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  };

  const handleReject = async (requestId: string, userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      const result = await rejectFriendRequest(requestId);
      if (result?.success) {
        toast.success("Friend request rejected");
        router.refresh();
      } else {
        throw new Error(result?.error || "Failed to reject request");
      }
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  };

  return (
    <div className="divide-y">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between py-4 px-6"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={request.sender.image || "/avatar.png"}
                alt={request.sender.name || request.sender.username}
              />
            </Avatar>
            <div>
              <p className="font-medium">
                {request.sender.name || request.sender.username}
              </p>
              <p className="text-sm text-muted-foreground">
                @{request.sender.username}
              </p>
              {request.reqMsg && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{request.reqMsg}"
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAccept(request.sender.id)}
              disabled={processingIds.has(request.sender.id)}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(request.id, request.sender.id)}
              disabled={processingIds.has(request.sender.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
