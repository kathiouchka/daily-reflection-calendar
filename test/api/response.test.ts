import { POST } from '../../app/api/response/route';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    response: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

describe('POST /api/response', () => {
  const mockUser = { id: '123', email: 'test@example.com' };
  const mockSession = { user: mockUser };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it('should return 400 for invalid input', async () => {
    const req = new Request('http://localhost/api/response', {
      method: 'POST',
      body: JSON.stringify({ response: '' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should create a new response if none exists', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newResponse = { id: 1, response: "My response", date: todayStr, userId: mockUser.id };
    const prisma = new PrismaClient();
    prisma.response.findUnique.mockResolvedValueOnce(null);
    prisma.response.create.mockResolvedValueOnce(newResponse);

    const req = new Request('http://localhost/api/response', {
      method: 'POST',
      body: JSON.stringify({ response: "My response" }),
    });
    const response = await POST(req);
    const json = await response.json();
    expect(json.response).toEqual(newResponse);
  });
});
