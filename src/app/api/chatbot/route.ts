import { NextRequest, NextResponse } from 'next/server';
import { callGeminiAPI, prepareMessagesWithSystemPrompt, ChatMessage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Check if chatbot is enabled
    if (process.env.ENABLE_CHATBOT !== 'true') {
      return NextResponse.json(
        { error: 'Chatbot is disabled' },
        { status: 403 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages }: { messages: ChatMessage[] } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Limit to latest 5 messages for performance
    const limitedMessages = messages.slice(-5);
    
    // Prepare messages with system prompt
    const preparedMessages = prepareMessagesWithSystemPrompt(limitedMessages);

    // Call Gemini API
    const response = await callGeminiAPI(preparedMessages, apiKey);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: response.content
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 