"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="text-8xl font-bold text-primary">404</div>
          </div>

          <p className="text-center text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex justify-center">
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
