import { getUserFollowers } from "@/actions/user.action";
import UserCard from "@/components/UserCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface Props {
  params: {
    username: string;
  };
}

export default async function FollowersPage({ params }: Props) {
  const { username } = params;
  const followers = await getUserFollowers(username);

  if (!followers) {
    notFound();
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Followers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {followers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No followers yet
          </div>
        ) : (
          <div className="divide-y">
            {followers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
