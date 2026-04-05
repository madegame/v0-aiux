import { NextRequest, NextResponse } from 'next/server';

// In-memory chat history (replace with database in production)
const chatHistory: Record<string, any[]> = {
  'prompt-engine': [],
  'automation': [],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'prompt-engine';
  const limit = parseInt(searchParams.get('limit') || '50');

  const messages = chatHistory[type as keyof typeof chatHistory] || [];
  return NextResponse.json(messages.slice(-limit));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'prompt-engine', role, provider, message, context } = body;

    const chatEntry = {
      id: Date.now().toString(),
      type,
      role,
      provider,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    if (!chatHistory[type as keyof typeof chatHistory]) {
      chatHistory[type as keyof typeof chatHistory] = [];
    }

    chatHistory[type as keyof typeof chatHistory].push(chatEntry);

    return NextResponse.json(chatEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
