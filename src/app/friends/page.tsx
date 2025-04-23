import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  getIncomingFriendRequest,
  getOutGoingFriendRequest,
} from "@/actions/friendRequest.action";
import FriendList from "./components/FriendList";
import OutgoingRequests from "./components/OutgoingRequests";
import IncomingRequests from "./components/IncomingRequests";
import FriendsSkeleton from "./components/FriendsSkeleton";
// import { redirect } from "next/navigation";
// import { useAuth } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  // const { userId } = useAuth();

  // if (!userId) {
  //   redirect("/sign-in");
  // }

  // Fetch friend requests data
  const outgoingRequests = await getOutGoingFriendRequest();
  const incomingRequests = await getIncomingFriendRequest();

  // Count for badge indicators
  const outgoingCount = outgoingRequests?.length || 0;
  const incomingCount = incomingRequests?.length || 0;

  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="friends">My Friends</TabsTrigger>
        <TabsTrigger value="outgoing">
          Sent Requests
          {outgoingCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {outgoingCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="incoming">
          Received Requests
          {incomingCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {incomingCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends">
        <Card>
          <CardContent className="p-0 sm:p-6">
            <Suspense fallback={<FriendsSkeleton />}>
              <FriendList />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="outgoing">
        <Card>
          <CardContent className="p-0 sm:p-6">
            <Suspense fallback={<FriendsSkeleton />}>
              <OutgoingRequests requests={outgoingRequests} />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="incoming">
        <Card>
          <CardContent className="p-0 sm:p-6">
            <Suspense fallback={<FriendsSkeleton />}>
              <IncomingRequests requests={incomingRequests} />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
