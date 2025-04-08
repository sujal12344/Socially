import { getDbUserId } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getProfileByUsername, getUserPosts } from "@/actions/profile.action";

interface Props {
  params: {
    username: string;
  };
}

export default async function PostsPage({ params }: Props) {
  const { username } = params;

  const user = await getProfileByUsername(username);

  if (!user) {
    notFound();
  }

  const [posts, dbUserId] = await Promise.all([
    await getUserPosts(user.id),
    await getDbUserId(),
  ]);

  if (!posts) {
    notFound();
  }

  return posts.length === 0 ? (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        No posts yet
      </CardContent>
    </Card>
  ) : (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
      ))}
    </div>
  );
}
