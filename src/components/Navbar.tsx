import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user.action";
import { getUnreadMessageCount } from "@/actions/message.action";
import { getIncomingFriendRequest } from "@/actions/friendRequest.action";
import { getUnreadNotificationCount } from "@/actions/notification.action";

async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser();

  const unreadCount = { message: 0, notification: 0, friendRequest: 0 };

  if (!user) return null;
  unreadCount.message = await getUnreadMessageCount();
  unreadCount.notification = await getUnreadNotificationCount();
  unreadCount.friendRequest = (await getIncomingFriendRequest()).length;

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-primary font-mono tracking-wider"
            >
              Socially
            </Link>
          </div>

          <DesktopNavbar unreadCount={unreadCount} />
          <MobileNavbar unreadCount={unreadCount} />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
