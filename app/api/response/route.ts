// app/api/response/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
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

    const { response } = await request.json();
    
    if (!response || typeof response !== 'string') {
      return NextResponse.json({ error: 'Invalid response data' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's phrase
    const todayPhrase = await prisma.phrase.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!todayPhrase) {
      return NextResponse.json({ error: 'No phrase found for today' }, { status: 404 });
    }

    // Check if user already has a response for today's phrase
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userId: user.id,
        phraseId: todayPhrase.id,
      },
    });

    let savedResponse;
    if (existingResponse) {
      // Update existing response
      savedResponse = await prisma.userResponse.update({
        where: { id: existingResponse.id },
        data: { responseText: response },
      });
    } else {
      // Create new response
      savedResponse = await prisma.userResponse.create({
        data: {
          responseText: response,
          userId: user.id,
          phraseId: todayPhrase.id,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      response: savedResponse.responseText 
    }, { status: existingResponse ? 200 : 201 }); // 200 OK if updated, 201 Created if new

  } catch (error) {
    logger.error({ err: error, userEmail: session.user.email }, 'Error saving response');
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Declare session variable outside the try block so it's available in catch
  let userEmail: string | undefined;
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Store email for potential error logging
    userEmail = session.user.email;

    // Get the user from the database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Validate date parameter format
    if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);

    // Find the phrase for the given date
    const phrase = await prisma.phrase.findFirst({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!phrase) {
      return NextResponse.json({ 
        response: null 
      });
    }

    // Get the user's response for this phrase
    const userResponse = await prisma.userResponse.findFirst({
      where: {
        userId: user.id,
        phraseId: phrase.id,
      },
    });

    return NextResponse.json({ 
      response: userResponse ? userResponse.responseText : null 
    });
  } catch (error) {
    logger.error({ err: error, userEmail }, 'Error fetching response');
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 });
  }
}
