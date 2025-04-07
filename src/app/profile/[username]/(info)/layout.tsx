import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";

interface Props {
  params: {
    username: string;
  };
  children: React.ReactNode;
}

export default function Layout({ children, params }: Props) {
  const { username } = params;

  return (
    <div className="space-y-6">
      <ProfileHeader username={username} />
      <ProfileTabs username={username} />

      {children}
    </div>
  );
}
