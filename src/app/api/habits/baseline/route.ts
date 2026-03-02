import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = session.user;
    const user = await prisma.user.findUnique({ where: { email: email as string } });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Default Developer Habits
    const habits = [
      { title: "Running", userId: user.id },
      { title: "Gym / Workout", userId: user.id },
      { title: "DSA Problem Solving", userId: user.id },
      { title: "Read technical documentation / tech blog", userId: user.id },
      { title: "Deep Work (2 hours uninterrupted)", userId: user.id },
      { title: "Review 1 Open Source PR / Code Snippet", userId: user.id },
    ];

    await prisma.habit.createMany({
      data: habits,
      skipDuplicates: true,
    });

    return NextResponse.json({ message: "Default habits generated successfully" });
  } catch (error) {
    console.error("[HABITS_BASELINE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
