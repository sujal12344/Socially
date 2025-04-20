import { getConversations } from "@/actions/message.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const conversations = await getConversations();

  if (!conversations) {
    redirect("/sign-in");
  }

  return (
    <div className="divide-y">
      {conversations.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          No conversations yet. Start chatting with someone from their profile!
        </div>
      ) : (
        conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/chat/${conversation.otherUser.username}`}
            className="block hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start p-4 gap-3">
              <Avatar>
                <AvatarImage
                  src={conversation.otherUser.image ?? "/avatar.png"}
                  alt={
                    conversation.otherUser.name ||
                    conversation.otherUser.username
                  }
                />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-medium truncate">
                    {conversation.otherUser.name ||
                      conversation.otherUser.username}
                  </p>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {formatDistanceToNow(
                      new Date(conversation.lastMessage.createdAt),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {conversation.lastMessage.fromMe && (
                    <span className="text-xs text-muted-foreground">You: </span>
                  )}
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.content}
                  </p>
                  {!conversation.lastMessage.read &&
                    !conversation.lastMessage.fromMe && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
