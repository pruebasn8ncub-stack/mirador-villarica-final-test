'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/chat/types';
import { AssistantAvatar } from './AssistantAvatar';
import { AttachmentImage } from './AttachmentImage';
import { AttachmentFloatingImage } from './AttachmentFloatingImage';
import { AttachmentGallery } from './AttachmentGallery';
import { AttachmentFloatingGallery } from './AttachmentFloatingGallery';
import { AttachmentFloatingTour360 } from './AttachmentFloatingTour360';
import { AttachmentFloatingMasterplan } from './AttachmentFloatingMasterplan';
import { AttachmentFloatingExplorer } from './AttachmentFloatingExplorer';
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

const TOUR_360_TOKEN = '[TOUR360]';
const TOUR_360_URL = 'https://lanube360.com/mirador-de-villarrica/';
const INVENTORY_TOKEN = '[INVENTARIO]';

/**
 * Renderiza texto del bot con soporte mínimo de markdown:
 * **negrita** (markdown estándar) y *negrita* (estilo WhatsApp, que es
 * el formato que devuelve la tool de parcelas). Además respeta saltos
 * de línea simples y párrafos. Evita dependencias externas.
 */
function FormattedContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return (
    <p className="whitespace-pre-line break-words leading-snug">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-bosque-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <strong key={i} className="font-semibold text-bosque-900">
              {part.slice(1, -1)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

interface MessageBubbleProps {
  message: Message;
  /** Si true, muestra el avatar junto a la burbuja del asistente. */
  showAvatar?: boolean;
  /**
   * Callback que la tarjeta dispara al hacer click en un CTA
   * (ej. "Ver detalles", "Simular crédito"). Se convierte en mensaje del usuario.
   */
  onAction?: (action: string) => void;
}

export function MessageBubble({
  message,
  showAvatar = true,
  onAction,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const hasTourToken = !isUser && message.content.includes(TOUR_360_TOKEN);
  const hasInventoryToken = !isUser && message.content.includes(INVENTORY_TOKEN);
  let displayContent = message.content;
  if (hasTourToken) displayContent = displayContent.replace(TOUR_360_TOKEN, '');
  if (hasInventoryToken) displayContent = displayContent.replace(INVENTORY_TOKEN, '');
  displayContent = displayContent.trim();

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
        <div className={cn('mb-0.5', showAvatar ? 'opacity-100' : 'opacity-0')}>
          <AssistantAvatar size="xs" robot />
        </div>
      )}

      <div className={cn('flex max-w-[85%] flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
        {!hideBubble && (
          <div
            className={cn(
              'relative rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug',
              isUser
                ? 'bg-bosque-800 text-crema rounded-br-sm shadow-chat-bubble-user'
                : 'bg-white text-bosque-900 rounded-bl-sm border border-bosque-100 shadow-chat-bubble-bot'
            )}
          >
            {displayContent && <FormattedContent text={displayContent} />}
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
            case 'tour360_floating':
              return (
                <AttachmentFloatingTour360
                  key={key}
                  url={att.url}
                  caption={att.caption}
                  poster={att.poster}
                  title={att.title}
                />
              );
            case 'masterplan_floating':
              return (
                <AttachmentFloatingMasterplan
                  key={key}
                  url={att.url}
                  caption={att.caption}
                  title={att.title}
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

        {(hasTourToken || hasInventoryToken) && (
          <AttachmentFloatingExplorer
            initialTab={hasInventoryToken && !hasTourToken ? 'inventory' : 'tour'}
            tourUrl={TOUR_360_URL}
          />
        )}
      </div>
    </div>
  );
}
