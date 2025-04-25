import {
  BellIcon,
  HomeIcon,
  MessageCircleIcon,
  UserIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import { currentUser } from "@clerk/nextjs/server";
import { unreadCount } from "@/types";

async function DesktopNavbar({ unreadCount }: unreadCount) {
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/chat" className="relative">
              <MessageCircleIcon className="h-5 w-5" />
              <span className="hidden lg:inline ml-1">Messages</span>
              {unreadCount.message > 0 && (
                <span className="absolute -top-0.5 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  {unreadCount.message > 99 ? "99+" : unreadCount.message}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications" className="relative">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
              {unreadCount.notification > 0 && (
                <span className="absolute -top-0.5 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  {unreadCount.notification > 99
                    ? "99+"
                    : unreadCount.notification}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/friends" className="relative">
              <Users className="h-5 w-5" />
              <span className="hidden lg:inline ml-1">Friends</span>
              {unreadCount.friendRequest > 0 && (
                <span className="absolute -top-0.5 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  {unreadCount.friendRequest > 99
                    ? "99+"
                    : unreadCount.friendRequest}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;
