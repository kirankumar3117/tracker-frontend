import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: habitId } = await params;
    const body = await req.json();
    const { date, isCompleted } = body; // date should be an ISO string, e.g. "2023-10-31T00:00:00.000Z"

    if (!date || typeof isCompleted !== "boolean") {
      return new NextResponse("Date and isCompleted are required", { status: 400 });
    }

    // Ensure date is purely the date part (standardizing hours to 0)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit || habit.userId !== user.id) {
      return new NextResponse("Habit Not Found", { status: 404 });
    }

    // Upsert the log for this specific date
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: habitId,
          date: targetDate,
        }
      },
      update: {
        isCompleted
      },
      create: {
        habitId,
        date: targetDate,
        isCompleted
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("[HABIT_LOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
