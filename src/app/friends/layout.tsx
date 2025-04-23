import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friends | Socially",
  description: "Manage your friends and friend requests",
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-4 md:py-8 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Friends</h1>
      {children}
    </div>
  );
}
