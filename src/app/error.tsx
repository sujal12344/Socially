"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon, HomeIcon, RefreshCcwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <AlertCircleIcon className="text-destructive size-5" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="text-7xl font-bold text-destructive">Error</div>
          </div>

          <p className="text-center text-muted-foreground">
            {error.message || "An unexpected error occurred."}
          </p>

          <div className="flex justify-center gap-3">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCcwIcon className="size-4" />
              Try again
            </Button>
            <Button asChild className="gap-2">
              <Link href="/">
                <HomeIcon className="size-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
