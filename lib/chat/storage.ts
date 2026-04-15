import type { Message } from './types';

const SESSION_KEY = 'mirador_chat_session_id';
const messagesKey = (sessionId: string) => `mirador_chat_messages_${sessionId}`;

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function resetSession(): string {
  if (typeof window === 'undefined') return '';
  const oldId = window.sessionStorage.getItem(SESSION_KEY);
  if (oldId) {
    window.sessionStorage.removeItem(messagesKey(oldId));
  }
  const newId = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, newId);
  return newId;
}

export function loadMessages(sessionId: string): Message[] {
  if (typeof window === 'undefined' || !sessionId) return [];
  try {
    const raw = window.sessionStorage.getItem(messagesKey(sessionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMessages(sessionId: string, messages: Message[]): void {
  if (typeof window === 'undefined' || !sessionId) return;
  try {
    window.sessionStorage.setItem(messagesKey(sessionId), JSON.stringify(messages));
  } catch {
    // sessionStorage lleno o bloqueado: silenciar, no romper la UI.
  }
}
