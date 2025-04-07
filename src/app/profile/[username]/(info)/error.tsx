"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, RefreshCcwIcon } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile error:", error);
  }, [error]);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="text-destructive size-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center space-y-4">
        <p className="text-muted-foreground">
          We couldn't load this profile section.
        </p>
        <Button onClick={reset} className="gap-2" variant="outline">
          <RefreshCcwIcon className="size-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
