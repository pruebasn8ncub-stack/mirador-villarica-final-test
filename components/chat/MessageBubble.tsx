'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/chat/types';
import { AssistantAvatar } from './AssistantAvatar';
import { AttachmentImage } from './AttachmentImage';
import { AttachmentFloatingImage } from './AttachmentFloatingImage';
import { AttachmentGallery } from './AttachmentGallery';
import { AttachmentFloatingGallery } from './AttachmentFloatingGallery';
import { AttachmentWhatsAppLink } from './AttachmentWhatsAppLink';

interface MessageBubbleProps {
  message: Message;
  /** Si true, muestra el avatar junto a la burbuja del asistente. */
  showAvatar?: boolean;
  /** Si true, muestra timestamp visible (sin hover). */
  alwaysShowTimestamp?: boolean;
}

function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function MessageBubble({
  message,
  showAvatar = true,
  alwaysShowTimestamp = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // silencioso
    }
  };

  return (
    <div
      className={cn(
        'group flex items-end gap-2 animate-message-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar solo en mensajes del asistente */}
      {!isUser && (
        <div className={cn('mb-1', showAvatar ? 'opacity-100' : 'opacity-0')}>
          <AssistantAvatar size="xs" />
        </div>
      )}

      <div className={cn('flex max-w-[82%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-bosque-800 text-crema rounded-br-sm shadow-chat-bubble-user'
              : 'bg-white text-bosque-900 rounded-bl-sm border border-bosque-100 shadow-chat-bubble-bot'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {message.attachments?.map((att, idx) => {
            const key = `${message.id}-att-${idx}`;
            if (att.type === 'image') {
              return <AttachmentImage key={key} url={att.url} caption={att.caption} />;
            }
            if (att.type === 'image_floating') {
              return (
                <AttachmentFloatingImage
                  key={key}
                  url={att.url}
                  caption={att.caption}
                  title={att.title}
                />
              );
            }
            if (att.type === 'gallery') {
              return <AttachmentGallery key={key} images={att.images} />;
            }
            if (att.type === 'gallery_floating') {
              return (
                <AttachmentFloatingGallery
                  key={key}
                  images={att.images}
                  caption={att.caption}
                />
              );
            }
            if (att.type === 'whatsapp_link') {
              return <AttachmentWhatsAppLink key={key} url={att.url} label={att.label} />;
            }
            return null;
          })}
        </div>

        {/* Meta row: timestamp + copiar */}
        <div
          className={cn(
            'mt-1 flex items-center gap-2 px-1 text-[10px] text-bosque-400',
            isUser ? 'flex-row-reverse' : 'flex-row',
            alwaysShowTimestamp
              ? 'opacity-100'
              : 'opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100'
          )}
        >
          <span className="tabular-nums">{formatTime(message.timestamp)}</span>
          {!isUser && message.content && (
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1 rounded px-1 py-0.5 text-bosque-400 hover:bg-bosque-50 hover:text-bosque-700"
              aria-label={copied ? 'Copiado' : 'Copiar mensaje'}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
