"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function FriendsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-md mt-8">
      <CardContent className="pt-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading your friends list or friend requests.
        </p>
        <p className="text-sm text-destructive mb-6">{error.message}</p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => reset()}>Try again</Button>
      </CardFooter>
    </Card>
  );
}
