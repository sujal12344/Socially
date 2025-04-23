"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toggleFriendRequest } from "@/actions/friendRequest.action";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function OutgoingRequests({
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
          You haven't sent any friend requests.
        </p>
      </div>
    );
  }

  const cancelRequest = async (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      const result = await toggleFriendRequest(userId);
      if (result?.success) {
        toast.success("Friend request cancelled");
        router.refresh();
      } else {
        throw new Error("Failed to cancel request");
      }
    } catch (error) {
      toast.error("Failed to cancel request");
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
                src={request.receiver.image || "/avatar.png"}
                alt={request.receiver.name || request.receiver.username}
              />
            </Avatar>
            <div>
              <p className="font-medium">
                {request.receiver.name || request.receiver.username}
              </p>
              <p className="text-sm text-muted-foreground">
                @{request.receiver.username}
              </p>
              {request.reqMsg && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{request.reqMsg}"
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => cancelRequest(request.receiver.id)}
            disabled={processingIds.has(request.receiver.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}
