/**
 * Bus de eventos para abrir el chat con contexto sembrado desde cualquier
 * parte del sitio (master plan interactivo, cards de parcela, CTAs, etc).
 *
 * Uso desde un componente:
 *   openChatWith({ parcela: 'P-24', intent: 'consulta_lote' })
 *
 * El ChatWidget escucha el evento, abre la ventana y prefilla el input
 * (no envía automáticamente — el usuario decide).
 */

export interface ChatOpenContext {
  parcela?: string;
  intent?: 'consulta_lote' | 'cotizar' | 'masterplan' | 'general';
  prefill?: string;
}

export const CHAT_OPEN_EVENT = 'mirador:openchat';

export function openChatWith(ctx: ChatOpenContext = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ChatOpenContext>(CHAT_OPEN_EVENT, { detail: ctx }));
}

export function buildPrefillFromContext(ctx: ChatOpenContext): string {
  if (ctx.prefill) return ctx.prefill;
  if (ctx.parcela && ctx.intent === 'consulta_lote') {
    return `Me interesa el lote ${ctx.parcela}. ¿Está disponible y cuál es el precio?`;
  }
  if (ctx.intent === 'cotizar') return 'Quiero cotizar una parcela.';
  if (ctx.intent === 'masterplan') return 'Quiero ver el master plan del proyecto.';
  return '';
}
