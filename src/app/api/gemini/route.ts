import { NextRequest, NextResponse } from 'next/server';

const MODELS = [
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
];

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

  // 사용 가능한 버그 해결용 다중 모델/버전 시도 루프
  let lastError = 'Failed to call Gemini API';
  let lastStatus = 500;

  for (const apiVersion of ['v1', 'v1beta']) {
    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
      try {
        console.log(`[Gemini API] Trying ${apiVersion} with model ${model}...`);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log(`[Gemini API] Success using ${apiVersion} / ${model}`);
          return NextResponse.json({ text });
        } else {
          const errText = await response.text();
          console.warn(`[Gemini API] Failed for ${apiVersion}/${model}:`, errText);
          lastError = errText;
          lastStatus = response.status;
        }
      } catch (err: any) {
        console.error(`[Gemini API] Network error for ${apiVersion}/${model}:`, err.message);
        lastError = err.message;
      }
    }
  }

  return NextResponse.json({ error: lastError }, { status: lastStatus });
}


