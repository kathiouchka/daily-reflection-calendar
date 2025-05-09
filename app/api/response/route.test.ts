/**
 * @jest-environment node
 */

import { POST, GET } from './route'; // Adjust the import path as needed
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

// Mock NextAuth
jest.mock('next-auth/next');
const mockGetServerSession = getServerSession as jest.Mock;

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    phrase: {
      findFirst: jest.fn(),
    },
    userResponse: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockPhraseFindFirst = prisma.phrase.findFirst as jest.Mock;
const mockUserResponseFindFirst = prisma.userResponse.findFirst as jest.Mock;
const mockUserResponseCreate = prisma.userResponse.create as jest.Mock;
const mockUserResponseUpdate = prisma.userResponse.update as jest.Mock;

// Mock Logger
jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
}));
const mockLoggerError = logger.error as jest.Mock;

// Helper to create a mock NextRequest
const createMockRequest = (method: string, body?: any, searchParams?: Record<string, string>): NextRequest => {
  const url = new URL(`http://localhost/api/response${searchParams ? '?' + new URLSearchParams(searchParams).toString() : ''}`);
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

describe('/api/response', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const mockUser = { id: 'user-id-123', email: 'test@example.com' };
    const mockPhrase = { id: 1, text: 'Today\'s phrase', date: new Date(), language: 'en' };
    const mockRequestBody = { response: 'Test response' };

    it('should create a new response and return 201 if none exists', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(mockPhrase);
      mockUserResponseFindFirst.mockResolvedValue(null); // No existing response
      mockUserResponseCreate.mockResolvedValue({ ...mockRequestBody, id: 1, userId: mockUser.id, phraseId: mockPhrase.id, responseText: mockRequestBody.response });

      const request = createMockRequest('POST', mockRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(responseBody.success).toBe(true);
      expect(responseBody.response).toBe(mockRequestBody.response);
      expect(mockUserResponseCreate).toHaveBeenCalledWith({
        data: {
          responseText: mockRequestBody.response,
          userId: mockUser.id,
          phraseId: mockPhrase.id,
        },
      });
      expect(mockUserResponseUpdate).not.toHaveBeenCalled();
    });

    it('should update an existing response and return 200', async () => {
      // Arrange
      const existingResponse = { id: 1, userId: mockUser.id, phraseId: mockPhrase.id, responseText: 'Old response' };
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(mockPhrase);
      mockUserResponseFindFirst.mockResolvedValue(existingResponse);
      mockUserResponseUpdate.mockResolvedValue({ ...existingResponse, responseText: mockRequestBody.response });

      const request = createMockRequest('POST', mockRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody.success).toBe(true);
      expect(responseBody.response).toBe(mockRequestBody.response);
      expect(mockUserResponseUpdate).toHaveBeenCalledWith({
        where: { id: existingResponse.id },
        data: { responseText: mockRequestBody.response },
      });
      expect(mockUserResponseCreate).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      const request = createMockRequest('POST', mockRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseBody.error).toBe('Unauthorized');
    });

    it('should return 404 if user is not found in database', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(null);
      const request = createMockRequest('POST', mockRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(responseBody.error).toBe('User not found');
    });

    it('should return 400 if response data is invalid', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      const request = createMockRequest('POST', { response: 123 }); // Invalid response type

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid response data');
    });
    
    it('should return 400 if request body is malformed JSON', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      
      const request = new NextRequest('http://localhost/api/response', {
        method: 'POST',
        body: '{\"response\": \"test\"', // Malformed JSON
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const responseBody = await response.json(); // This will likely fail if not handled by Next.js
      
      // Assert
      // Note: Next.js might handle malformed JSON before our handler is called, 
      // or our handler might throw an error when request.json() is called.
      // We test for the 500 status that our catch block would return, or a 400 if Next.js handles it.
      expect([400, 500]).toContain(response.status);
      if (response.status === 500) {
        expect(responseBody.error).toBe('Failed to save response');
        expect(mockLoggerError).toHaveBeenCalled();
      } else {
        // If Next.js returns a 400 for malformed JSON directly
        expect(responseBody.error).toBeDefined(); 
      }
    });

    it('should return 404 if no phrase is found for today', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(null); // No phrase found
      const request = createMockRequest('POST', mockRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(responseBody.error).toBe('No phrase found for today');
    });

    it('should return 500 if database operation fails', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(mockPhrase);
      mockUserResponseFindFirst.mockResolvedValue(null);
      mockUserResponseCreate.mockRejectedValue(new Error('Database error')); // Simulate DB error

      const request = createMockRequest('POST', mockRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseBody.error).toBe('Failed to save response');
      expect(mockLoggerError).toHaveBeenCalledWith(
        { err: new Error('Database error'), userEmail: 'test@example.com' }, 
        'Error saving response'
      );
    });
  });

  describe('GET', () => {
    const mockUser = { id: 'user-id-123', email: 'test@example.com' };
    const mockPhrase = { id: 1, text: 'A phrase', date: new Date(), language: 'en' };
    const mockUserResponse = { responseText: 'User\'s test response' };

    it('should return the user\'s response for today if no date is provided', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(mockPhrase); // For today
      mockUserResponseFindFirst.mockResolvedValue(mockUserResponse);
      
      const request = createMockRequest('GET');

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody.response).toBe(mockUserResponse.responseText);
      expect(mockPhraseFindFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ date: expect.any(Object) })
      }));
      expect(mockUserResponseFindFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: mockUser.id, phraseId: mockPhrase.id }
      }));
    });

    it('should return null if no response exists for today', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(mockPhrase);
      mockUserResponseFindFirst.mockResolvedValue(null); // No response

      const request = createMockRequest('GET');
      
      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody.response).toBeNull();
    });

    it('should return null if no phrase exists for today', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(null); // No phrase

      const request = createMockRequest('GET');

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody.response).toBeNull();
      expect(mockUserResponseFindFirst).not.toHaveBeenCalled();
    });

    it('should return the user\'s response for a specific valid date', async () => {
      // Arrange
      const specificDate = '2023-01-15';
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockResolvedValue(mockPhrase); // For specific date
      mockUserResponseFindFirst.mockResolvedValue(mockUserResponse);

      const request = createMockRequest('GET', undefined, { date: specificDate });

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody.response).toBe(mockUserResponse.responseText);
      const expectedDate = new Date(specificDate);
      expectedDate.setHours(0,0,0,0);
      expect(mockPhraseFindFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          date: {
            gte: expectedDate,
            lt: new Date(expectedDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      const request = createMockRequest('GET');

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseBody.error).toBe('Unauthorized');
    });

    it('should return 404 if user is not found in database', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(null);
      const request = createMockRequest('GET');

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(responseBody.error).toBe('User not found');
    });

    it('should return 400 if date parameter has an invalid format', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      const request = createMockRequest('GET', undefined, { date: 'invalid-date' });

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid date format');
    });

    it('should return 500 if database operation fails', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPhraseFindFirst.mockRejectedValue(new Error('Database error')); // Simulate DB error

      const request = createMockRequest('GET');

      // Act
      const response = await GET(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseBody.error).toBe('Failed to fetch response');
      expect(mockLoggerError).toHaveBeenCalledWith(
        { err: new Error('Database error'), userEmail: 'test@example.com' },
        'Error fetching response'
      );
    });
  });
}); 