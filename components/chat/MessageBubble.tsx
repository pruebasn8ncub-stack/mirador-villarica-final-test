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
import { AttachmentPropertyCard } from './AttachmentPropertyCard';
import { AttachmentPropertyCarousel } from './AttachmentPropertyCarousel';
import { AttachmentCompareTable } from './AttachmentCompareTable';
import { AttachmentMapCard } from './AttachmentMapCard';
import { AttachmentMortgageSimulator } from './AttachmentMortgageSimulator';
import { AttachmentBrochure } from './AttachmentBrochure';
import { AttachmentVideo } from './AttachmentVideo';
import { AttachmentLeadForm } from './AttachmentLeadForm';
import { AttachmentHandoff } from './AttachmentHandoff';

interface MessageBubbleProps {
  message: Message;
  /** Si true, muestra el avatar junto a la burbuja del asistente. */
  showAvatar?: boolean;
  /** Si true, muestra timestamp visible (sin hover). */
  alwaysShowTimestamp?: boolean;
  /**
   * Callback que la tarjeta dispara al hacer click en un CTA
   * (ej. "Ver detalles", "Simular crédito"). Se convierte en mensaje del usuario.
   */
  onAction?: (action: string) => void;
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
  onAction,
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

  /** Detecta si todas las attachments del mensaje son rich-cards full-width
   *  (se renderizan sin burbuja de fondo para dejar el layout del diseño). */
  const hasOnlyRichCards =
    Boolean(message.attachments?.length) &&
    message.attachments!.every((a) =>
      [
        'property_card',
        'property_carousel',
        'compare_table',
        'map_card',
        'mortgage_simulator',
        'brochure_card',
        'video_card',
        'lead_form',
        'handoff',
      ].includes(a.type)
    );
  const hideBubble = hasOnlyRichCards && !message.content.trim();

  return (
    <div
      className={cn(
        'group flex items-end gap-2 animate-message-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className={cn('mb-1', showAvatar ? 'opacity-100' : 'opacity-0')}>
          <AssistantAvatar size="xs" />
        </div>
      )}

      <div className={cn('flex max-w-[88%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        {!hideBubble && (
          <div
            className={cn(
              'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              isUser
                ? 'bg-bosque-800 text-crema rounded-br-sm shadow-chat-bubble-user'
                : 'bg-white text-bosque-900 rounded-bl-sm border border-bosque-100 shadow-chat-bubble-bot'
            )}
          >
            {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        )}

        {message.attachments?.map((att, idx) => {
          const key = `${message.id}-att-${idx}`;
          switch (att.type) {
            case 'image':
              return <AttachmentImage key={key} url={att.url} caption={att.caption} />;
            case 'image_floating':
              return (
                <AttachmentFloatingImage
                  key={key}
                  url={att.url}
                  caption={att.caption}
                  title={att.title}
                />
              );
            case 'gallery':
              return <AttachmentGallery key={key} images={att.images} />;
            case 'gallery_floating':
              return (
                <AttachmentFloatingGallery
                  key={key}
                  images={att.images}
                  caption={att.caption}
                />
              );
            case 'whatsapp_link':
              return <AttachmentWhatsAppLink key={key} url={att.url} label={att.label} />;
            case 'property_card':
              return (
                <AttachmentPropertyCard
                  key={key}
                  parcela={att.parcela}
                  sqm={att.sqm}
                  price={att.price}
                  image={att.image}
                  features={att.features}
                  ctas={att.ctas}
                  status={att.status}
                  onAction={onAction}
                />
              );
            case 'property_carousel':
              return (
                <AttachmentPropertyCarousel
                  key={key}
                  items={att.items}
                  onPick={(it) => onAction?.(`Ver Parcela ${it.parcela}`)}
                />
              );
            case 'compare_table':
              return (
                <AttachmentCompareTable
                  key={key}
                  rows={att.rows}
                  onPick={(rol) => onAction?.(`Ver Parcela ${rol}`)}
                />
              );
            case 'map_card':
              return (
                <AttachmentMapCard
                  key={key}
                  title={att.title}
                  subtitle={att.subtitle}
                  address={att.address}
                  embedUrl={att.embedUrl}
                  lat={att.lat}
                  lng={att.lng}
                  nearbyMinutes={att.nearbyMinutes}
                  onTour={onAction ? () => onAction('Ver video drone') : undefined}
                />
              );
            case 'mortgage_simulator':
              return (
                <AttachmentMortgageSimulator
                  key={key}
                  priceClp={att.priceClp}
                  priceUf={att.priceUf}
                  defaultDownPct={att.defaultDownPct}
                  defaultMonths={att.defaultMonths}
                />
              );
            case 'brochure_card':
              return (
                <AttachmentBrochure
                  key={key}
                  url={att.url}
                  title={att.title}
                  pages={att.pages}
                  sizeKb={att.sizeKb}
                  onSend={onAction ? () => onAction('Enviar brochure a mi email') : undefined}
                />
              );
            case 'video_card':
              return (
                <AttachmentVideo
                  key={key}
                  url={att.url}
                  thumb={att.thumb}
                  title={att.title}
                  duration={att.duration}
                />
              );
            case 'lead_form':
              return (
                <AttachmentLeadForm
                  key={key}
                  prompt={att.prompt}
                  fields={att.fields}
                  onSubmit={
                    onAction
                      ? () => onAction('Gracias, envié mis datos')
                      : undefined
                  }
                />
              );
            case 'handoff':
              return (
                <AttachmentHandoff
                  key={key}
                  advisorName={att.advisorName}
                  advisorRole={att.advisorRole}
                  whatsapp={att.whatsapp}
                  message={att.message}
                />
              );
            default:
              return null;
          }
        })}

        {/* Meta row: timestamp + copiar */}
        {message.content && (
          <div
            className={cn(
              'flex items-center gap-2 px-1 text-[10px] text-bosque-400',
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
        )}
      </div>
    </div>
  );
}
