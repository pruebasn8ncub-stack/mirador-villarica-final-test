import type { ChatRequest, ChatResponse } from './types';

const DEFAULT_TIMEOUT_MS = 15_000;

export class ChatApiError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ChatApiError';
  }
}

export async function sendChatMessage(
  request: ChatRequest,
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!res.ok) {
      const code =
        res.status === 429 ? 'rate_limit' : res.status === 400 ? 'validation' : 'upstream';
      throw new ChatApiError(`Chat API error ${res.status}`, code);
    }

    const data = (await res.json()) as ChatResponse;
    return data;
  } catch (err) {
    if (err instanceof ChatApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ChatApiError('Timeout al conectar con el asistente', 'timeout');
    }
    throw new ChatApiError('No se pudo conectar con el asistente', 'unknown');
  } finally {
    clearTimeout(timeout);
  }
}
