"use client";

import { getMessages, sendMessage } from "@/actions/message.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { SendIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
}

export default function ChatPage() {
  const { user } = useUser();
  const params = useParams<{ username: string }>();
  const username = params.username as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch messages on load
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages(username);
        setMessages(data || []);
      } catch (error) {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [username]);

  // Poll for new messages every secoond and scroll to bottom
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const pulledData = await getMessages(username);
        if (!pulledData) return;
        if (pulledData.length !== messages.length)
          setMessages(pulledData || []);
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 1000);

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => clearInterval(interval);
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(username, message);
      if (result.success && result.message) {
        // Adding type guard to ensure message exists
        setMessages((prev) => [...prev, result.message as Message]);
        setMessage("");
        formRef.current?.reset();
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px] overflow-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isSenderUser =
                user?.emailAddresses[0].emailAddress.split("@")[0] ===
                msg.sender.username;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-2",
                    isSenderUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isSenderUser && (
                    <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={msg.sender.image ?? "/avatar.png"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1 max-w-[80%]">
                    <div
                      className={cn(
                        "rounded-lg p-3 break-words overflow-hidden",
                        isSenderUser
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {msg.content}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t p-4 bg-background sticky bottom-0">
        <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[40px] max-h-[120px] flex-1 resize-none focus:ring-1 focus:ring-primary"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="self-end h-10 w-10"
            disabled={sending || !message.trim()}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
