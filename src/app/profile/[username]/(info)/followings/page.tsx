import { getUserFollowings } from "@/actions/user.action";
import UserCard from "@/components/UserCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface Props {
  params: {
    username: string;
  };
}

export default async function FollowingsPage({ params }: Props) {
  const { username } = params;
  const following = await getUserFollowings(username);

  if (!following) {
    notFound();
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Following</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {following.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Not following anyone yet
          </div>
        ) : (
          <div className="divide-y">
            {following.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
