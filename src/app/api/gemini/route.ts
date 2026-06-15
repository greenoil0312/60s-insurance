import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  const customKey = req.headers.get('x-gemini-key');
  const apiKey = customKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API Key가 설정되지 않았습니다. 상단 설정에서 API Key를 등록해주세요.' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt, imageBase64, mimeType } = body;

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  // 이미지 데이터 포함 여부에 따라 요청 페이로드 구성
  const parts: object[] = [{ text: prompt }];
  if (imageBase64) {
    parts.unshift({
      inline_data: {
        mime_type: mimeType || 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  const geminiPayload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiPayload),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json({ error: errText }, { status: response.status });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return NextResponse.json({ text });
}

