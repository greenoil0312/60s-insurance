import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GAS_URL = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL;
const GAS_API_KEY = process.env.GAS_API_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!GAS_URL || !GAS_API_KEY) {
    // Local File Database Fallback
    try {
      const dbPath = path.join(process.cwd(), 'local_db.json');
      let dbData: any[] = [];
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        dbData = JSON.parse(fileContent);
      }
      dbData.push({
        timestamp: new Date().toISOString(),
        ...body,
      });
      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
      console.log('[GAS Fallback] Saved data locally to local_db.json');
      return NextResponse.json({ success: true, message: '구글 시트가 연동되지 않아 로컬 파일(local_db.json)에 데이터를 저장했습니다.' });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: '로컬 데이터 저장 실패: ' + e.message });
    }
  }

  // API Key를 서버에서 주입하여 클라이언트에는 노출되지 않게 함
  const payload = { ...body, apiKey: GAS_API_KEY };

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  const result = await res.json();
  return NextResponse.json(result);
}

