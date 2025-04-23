import { Skeleton } from "@/components/ui/skeleton";

export default function FriendsSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
    </div>
  );
}
