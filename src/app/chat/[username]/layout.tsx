import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getUserByUsername } from "@/actions/user.action";
import { Card, CardHeader } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params: {
    username: string;
  };
}

export default async function ChatLayout({ children, params }: Props) {
  const { username } = params;

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  return (
    <>
      <CardHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Link
            href="/chat"
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <Link
            href={`/profile/${username}/posts`}
            className="flex items-center space-x-3"
          >
            <Avatar>
              <AvatarImage
                src={user.image ?? "/avatar.png"}
                alt={user.name || user.username}
              />
            </Avatar>
            <div>
              <p className="font-medium">{user.name || user.username}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </Link>
        </div>
      </CardHeader>
      {children}
    </>
  );
}
