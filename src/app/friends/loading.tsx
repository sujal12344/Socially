import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingFriends() {
  return (
    <div className="container py-4 md:py-8 max-w-6xl">
      <Skeleton className="h-10 w-48 mb-6" />

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="outgoing">Sent Requests</TabsTrigger>
          <TabsTrigger value="incoming">Received Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
