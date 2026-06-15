import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = '60s_insurance_session_id';

/**
 * 앱 접속 시 브라우저 sessionStorage에 UUID를 생성하거나 기존 UUID를 반환합니다.
 * 두 시트(User_Health_Log, Insurance_Match_Log)의 데이터를 연결하는 키로 사용됩니다.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
