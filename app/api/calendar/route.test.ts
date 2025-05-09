import { GET } from './route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Mock an entire module
jest.mock('next-auth/next');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    phrase: {
      findMany: jest.fn(),
    },
    userResponse: {
      findMany: jest.fn(),
    },
    // Add other models and methods if they are used by the route
  },
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {}, // Provide a mock implementation for authOptions
}));


// Typed mock for getServerSession
const mockGetServerSession = getServerSession as jest.Mock;

describe('GET /api/calendar', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for successful authentication
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    // Default mock for user found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-id-123',
      email: 'test@example.com',
    });
    // Default mock for phrases
    (prisma.phrase.findMany as jest.Mock).mockResolvedValue([]);
    // Default mock for user responses
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue([]);
  });

  test('should return 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null); // Simulate no session

    const request = new NextRequest('http://localhost/api/calendar?start=2023-01-01&end=2023-01-31');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  test('should return 404 if user is not found in database', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null); // Simulate user not found

    const request = new NextRequest('http://localhost/api/calendar?start=2023-01-01&end=2023-01-31');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('User not found');
  });

  test('should return 400 if start or end date is missing', async () => {
    const request = new NextRequest('http://localhost/api/calendar'); // No query params
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing start or end date');

    const requestWithStart = new NextRequest('http://localhost/api/calendar?start=2023-01-01');
    const responseWithStart = await GET(requestWithStart);
    const bodyWithStart = await responseWithStart.json();

    expect(responseWithStart.status).toBe(400);
    expect(bodyWithStart.error).toBe('Missing start or end date');

    const requestWithEnd = new NextRequest('http://localhost/api/calendar?end=2023-01-31');
    const responseWithEnd = await GET(requestWithEnd);
    const bodyWithEnd = await responseWithEnd.json();

    expect(responseWithEnd.status).toBe(400);
    expect(bodyWithEnd.error).toBe('Missing start or end date');
  });

  test('should return 200 with formatted phrases and responses on success', async () => {
    const mockPhrases = [
      { id: 1, text: 'Phrase 1', date: new Date('2023-01-15T00:00:00.000Z'), language: 'en' },
      { id: 2, text: 'Phrase 2', date: new Date('2023-01-16T00:00:00.000Z'), language: 'en' },
    ];
    const mockUserResponses = [
      {
        id: 1,
        userId: 'user-id-123',
        phraseId: 1,
        responseText: 'Response 1',
        createdAt: new Date(),
        phrase: mockPhrases[0],
      },
    ];

    (prisma.phrase.findMany as jest.Mock).mockResolvedValueOnce(mockPhrases);
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValueOnce(mockUserResponses);

    const request = new NextRequest('http://localhost/api/calendar?start=2023-01-01&end=2023-01-31');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.phrases).toEqual({
      '2023-01-15': 'Phrase 1',
      '2023-01-16': 'Phrase 2',
    });
    expect(body.responses).toEqual({
      '2023-01-15': 'Response 1',
    });

    // Check if prisma calls were made with correct parameters
    expect(prisma.phrase.findMany).toHaveBeenCalledWith({
      where: {
        date: {
          gte: new Date('2023-01-01'),
          lte: new Date('2023-01-31'),
        },
      },
    });
    expect(prisma.userResponse.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-id-123',
        phrase: {
          date: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-01-31'),
          },
        },
      },
      include: {
        phrase: true,
      },
    });
  });

  test('should return 200 with phrases and empty responses if no user responses exist', async () => {
    const mockPhrases = [
      { id: 1, text: 'Phrase 1', date: new Date('2023-02-10T00:00:00.000Z'), language: 'en' },
    ];
    (prisma.phrase.findMany as jest.Mock).mockResolvedValueOnce(mockPhrases);
    // No user responses, so the default mock of [] for userResponse.findMany is used

    const request = new NextRequest('http://localhost/api/calendar?start=2023-02-01&end=2023-02-28');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.phrases).toEqual({
      '2023-02-10': 'Phrase 1',
    });
    expect(body.responses).toEqual({});
  });

  test('should return 200 with empty phrases and responses if none exist', async () => {
    // Default mocks of [] for phrase.findMany and userResponse.findMany are used

    const request = new NextRequest('http://localhost/api/calendar?start=2023-03-01&end=2023-03-31');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.phrases).toEqual({});
    expect(body.responses).toEqual({});
  });

  test('should return 500 if there is a database error', async () => {
    (prisma.phrase.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/calendar?start=2023-01-01&end=2023-01-31');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to fetch calendar data');
  });
});