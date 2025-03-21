// app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the user from the database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
    }

    // Get phrases for the date range (these are public)
    const phrases = await prisma.phrase.findMany({
      where: {
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    // Get only the current user's responses
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userId: user.id,
        phrase: {
          date: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
      },
      include: {
        phrase: true,
      },
    });

    // Format the data
    const formattedPhrases: { [date: string]: string } = {};
    phrases.forEach((phrase) => {
      const dateStr = phrase.date.toISOString().split('T')[0];
      formattedPhrases[dateStr] = phrase.text;
    });

    const formattedResponses: { [date: string]: string } = {};
    userResponses.forEach((response) => {
      const dateStr = response.phrase.date.toISOString().split('T')[0];
      formattedResponses[dateStr] = response.responseText;
    });

    return NextResponse.json({
      phrases: formattedPhrases,
      responses: formattedResponses,
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
