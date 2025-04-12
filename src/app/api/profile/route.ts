import { getUserByUsername } from "@/actions/user.action";
import { getDbUserId } from "@/actions/user.action";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user is following this profile
    let isFollowing = false;
    const currentUserId = await getDbUserId();

    if (currentUserId) {
      const followRecord = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: currentUserId,
          },
        },
      });

      isFollowing = !!followRecord;
    }

    return NextResponse.json({ user, isFollowing });
  } catch (error) {
    console.error("Error in profile API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
