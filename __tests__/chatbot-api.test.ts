import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/chatbot/route';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Chatbot API', () => {
  it('should return error when chatbot is disabled', async () => {
    process.env.ENABLE_CHATBOT = 'false';
    
    const request = new NextRequest('http://localhost:3000/api/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Chatbot is disabled');
  });

  it('should return error when API key is not configured', async () => {
    process.env.ENABLE_CHATBOT = 'true';
    delete process.env.GEMINI_API_KEY;
    
    const request = new NextRequest('http://localhost:3000/api/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Gemini API key not configured');
  });

  it('should return error for invalid messages format', async () => {
    process.env.ENABLE_CHATBOT = 'true';
    process.env.GEMINI_API_KEY = 'test-key';
    
    const request = new NextRequest('http://localhost:3000/api/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        messages: 'invalid'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid messages format');
  });

  it('should return error for missing messages', async () => {
    process.env.ENABLE_CHATBOT = 'true';
    process.env.GEMINI_API_KEY = 'test-key';
    
    const request = new NextRequest('http://localhost:3000/api/chatbot', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid messages format');
  });
}); 