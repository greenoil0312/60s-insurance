/**
 * Google Apps Script Web App API 클라이언트
 * 프론트엔드에서 직접 GAS로 데이터를 전송하는 유틸리티
 */

const GAS_URL = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL || '';
const GAS_API_KEY = process.env.GAS_API_KEY || '';

export type SheetName = 'User_Health_Log' | 'Insurance_Match_Log';

export interface GasPayload {
  sheetName: SheetName;
  payload: (string | number | null)[];
}

/**
 * 구글 시트에 데이터 한 행을 추가합니다.
 * GAS 서버에서 API Key를 검증하여 스팸 쓰기를 방지합니다.
 */
export async function appendToSheet(data: GasPayload): Promise<{ success: boolean; error?: string }> {
  if (!GAS_URL) {
    console.warn('[GAS] NEXT_PUBLIC_GAS_WEB_APP_URL이 설정되지 않았습니다.');
    return { success: false, error: 'GAS URL not configured' };
  }

  try {
    const res = await fetch('/api/gas-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
