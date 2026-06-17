import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1JN0aw3FpN7t8QnAe4mbF9dz3oEiHjjKnLXyXwAjS99M';
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

// Load local service account credentials as fallback
let credentials: any = null;
try {
  const keyPath = path.join(process.cwd(), 'service_account.json');
  if (fs.existsSync(keyPath)) {
    credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }
} catch (err) {
  console.error('[Google Sheets] Local service_account.json reading failed:', err);
}

const finalEmail = CLIENT_EMAIL || credentials?.client_email;
const finalKey = PRIVATE_KEY ? PRIVATE_KEY.replace(/\\n/g, '\n') : credentials?.private_key;

/**
 * Initialize sheets, checking if specific tabs exist, and creating them if they don't.
 */
async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetName: string, headers: string[]) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetsList = meta.data.sheets || [];
    const exists = sheetsList.some((s: any) => s.properties?.title === sheetName);

    if (!exists) {
      console.log(`[Google Sheets] Sheet "${sheetName}" not found. Creating it...`);
      // Add sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetName }
              }
            }
          ]
        }
      });
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers]
        }
      });
      console.log(`[Google Sheets] Created sheet "${sheetName}" and added headers.`);
    }
  } catch (err: any) {
    console.error(`[Google Sheets] Failed to verify/create sheet "${sheetName}":`, err.message);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sheetName, payload } = body;

  if (!sheetName || !payload || !Array.isArray(payload)) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  // 1. Google Sheets API write attempt
  if (finalEmail && finalKey) {
    try {
      const auth = new google.auth.JWT(
        finalEmail,
        null,
        finalKey,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      const sheets = google.sheets({ version: 'v4', auth });

      // Define default headers for auto-creation
      const defaultHeaders = sheetName === 'User_Health_Log'
        ? ['시간', '세션 ID', '나이/성별', '검진 내용', '예측 질환']
        : ['시간', '세션 ID', '보험증권 내용', '보장 공백(Gaps)', '매칭 점수'];

      // Ensure target sheet exists
      await ensureSheetExists(sheets, SPREADSHEET_ID, sheetName, defaultHeaders);

      // Append row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:E`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [payload]
        }
      });

      console.log(`[Google Sheets] Successfully appended row to "${sheetName}"`);
      return NextResponse.json({ success: true, message: `구글 시트(${sheetName})에 성공적으로 저장되었습니다.` });
    } catch (apiErr: any) {
      console.error('[Google Sheets API Error] Fallback to local DB. Error:', apiErr.message);
    }
  }

  // 2. Local File Database Fallback (if credentials are empty or API call fails)
  try {
    const dbPath = path.join(process.cwd(), 'local_db.json');
    let dbData: any[] = [];
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, 'utf8');
      dbData = JSON.parse(fileContent);
    }
    dbData.push({
      timestamp: new Date().toISOString(),
      sheetName,
      payload
    });
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log('[Local Fallback] Saved data locally to local_db.json');
    return NextResponse.json({
      success: true,
      message: '구글 API 인증 실패 또는 에러로 인해 로컬 파일(local_db.json)에 데이터를 저장했습니다.'
    });
  } catch (fileErr: any) {
    return NextResponse.json({ success: false, error: '로컬 백업 저장 실패: ' + fileErr.message }, { status: 500 });
  }
}


