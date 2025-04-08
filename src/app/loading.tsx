import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-10">
        {/* Create Post Skeleton */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-11 rounded-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Skeletons */}
        <div className="space-y-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex space-x-3 sm:space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Who To Follow Skeleton */}
      {/* <div className="hidden lg:block lg:col-span-4 sticky top-24">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
