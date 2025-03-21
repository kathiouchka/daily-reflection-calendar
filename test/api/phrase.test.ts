import { GET } from '../../app/api/phrase/route';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    phrase: { findUnique: jest.fn() }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('GET /api/phrase', () => {
  it('should return the phrase for today if it exists', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const mockPhrase = { id: 1, text: "Test phrase", date: todayStr };
    const prisma = new PrismaClient();
    prisma.phrase.findUnique.mockResolvedValueOnce(mockPhrase);

    const response = await GET();
    const json = await response.json();
    expect(json.phrase).toEqual(mockPhrase);
  });
});
