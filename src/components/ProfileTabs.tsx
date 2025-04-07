"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileTabs({ username }: { username: string }) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Posts",
      href: `/profile/${username}/posts`,
    },
    {
      label: "Followers",
      href: `/profile/${username}/followers`,
    },
    {
      label: "Following",
      href: `/profile/${username}/followings`,
    },
  ];

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            pathname === tab.href
              ? "text-primary border-b-2 border-primary -mb-px"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
