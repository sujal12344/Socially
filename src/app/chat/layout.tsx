import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon } from "lucide-react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center">
            <MessageCircleIcon className="mr-2 h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}
