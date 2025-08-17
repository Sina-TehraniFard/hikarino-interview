import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';
import { PROMPTS, IMPORTANT_POLICY } from '@/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question, cards } = await req.json();

  const prompt = `
${IMPORTANT_POLICY}

${PROMPTS.character}

${PROMPTS.style}

${PROMPTS.technique}

【問い】
${question}

【引かれたカード】
- ${cards[0].position}：${cards[0].cardName}（${cards[0].isReversed ? "逆位置" : "正位置"}）
- ${cards[1].position}：${cards[1].cardName}（${cards[1].isReversed ? "逆位置" : "正位置"}）
- ${cards[2].position}：${cards[2].cardName}（${cards[2].isReversed ? "逆位置" : "正位置"}）
`;

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
      stream: true,
    });

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    const message = typeof error === 'object' && error && 'message' in error ? (error as { message: string }).message : 'Internal Server Error';
    
    // APIキーエラーの場合、詳細情報をログ出力
    if (message.includes('API key') || message.includes('401')) {
      console.error('API Key issue detected. Current key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    }
    
    return Response.json({ error: message }, { status: 500 });
  }
} 