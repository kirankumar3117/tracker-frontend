import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        logs: {
          orderBy: { date: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // We can compute streaks and completion percentage here or in the frontend. 
    // Wait, the prompt implies "backend logic for streaks and percentages".
    const enhancedHabits = habits.map((habit: any) => {
      let currentStreak = 0;
      let bestStreak = 0;
      let currentRun = 0;
      
      const oneDay = 24 * 60 * 60 * 1000;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logs = habit.logs.filter((log: any) => log.isCompleted);
      
      if (logs.length > 0) {
        // Calculate best streak
        logs.forEach((log: any, i: number) => {
          if (i === 0) {
            currentRun = 1;
            bestStreak = 1;
          } else {
            const diff = (new Date(log.date).getTime() - new Date(logs[i-1].date).getTime()) / oneDay;
            if (Math.round(diff) === 1) {
              currentRun++;
              bestStreak = Math.max(bestStreak, currentRun);
            } else {
              currentRun = 1;
            }
          }
        });

        // Calculate current streak
        let tempStreak = 0;
        let d = new Date(today);
        while (true) {
          const hasLog = logs.some((l: any) => {
            const ld = new Date(l.date);
            return ld.getDate() === d.getDate() && ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
          });
          
          if (hasLog) {
            tempStreak++;
            d = new Date(d.getTime() - oneDay);
          } else if (tempStreak === 0 && d.getTime() === today.getTime()) {
             // It's possible today isn't logged yet, try yesterday
             d = new Date(d.getTime() - oneDay);
          } else {
            break;
          }
        }
        currentStreak = tempStreak;
      }

      const totalDays = 30; // Let's base completion percentage on the last 30 days
      const last30DaysLogs = logs.filter((l: any) => (today.getTime() - new Date(l.date).getTime()) / oneDay <= totalDays);
      const completionPercentage = Math.round((last30DaysLogs.length / totalDays) * 100);

      return {
        ...habit,
        currentStreak,
        bestStreak,
        completionPercentage,
      };
    });

    return NextResponse.json(enhancedHabits);
  } catch (error) {
    console.error("[HABITS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        userId: user.id,
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("[HABITS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
