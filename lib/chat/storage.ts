import type { LeadGateData, Message } from './types';

const SESSION_KEY = 'mirador_chat_session_id';
const messagesKey = (sessionId: string) => `mirador_chat_messages_${sessionId}`;
const leadKey = (sessionId: string) => `mirador_chat_lead_${sessionId}`;

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
    window.sessionStorage.removeItem(leadKey(oldId));
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

export function clearMessages(sessionId: string): void {
  if (typeof window === 'undefined' || !sessionId) return;
  try {
    window.sessionStorage.removeItem(messagesKey(sessionId));
  } catch {
    // silenciar
  }
}

export function loadLead(sessionId: string): LeadGateData | null {
  if (typeof window === 'undefined' || !sessionId) return null;
  try {
    const raw = window.sessionStorage.getItem(leadKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeadGateData;
    if (!parsed?.nombre || !parsed?.email || !parsed?.whatsapp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLead(sessionId: string, lead: LeadGateData): void {
  if (typeof window === 'undefined' || !sessionId) return;
  try {
    window.sessionStorage.setItem(leadKey(sessionId), JSON.stringify(lead));
  } catch {
    // silenciar
  }
}
