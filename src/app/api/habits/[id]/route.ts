import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit || habit.userId !== user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.habit.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[HABIT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
