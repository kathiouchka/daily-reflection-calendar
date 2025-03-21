// app/api/phrase/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request) {
  const today = new Date();
  // Create a start-of-day and end-of-day for today.
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const phrase = await prisma.phrase.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  if (!phrase) {
    return NextResponse.json({ message: "No phrase found for today" }, { status: 404 });
  }

  return NextResponse.json({ phrase });
}
