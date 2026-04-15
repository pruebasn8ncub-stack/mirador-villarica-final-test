import { cn } from '@/lib/utils';
import type { Message } from '@/lib/chat/types';
import { AttachmentImage } from './AttachmentImage';
import { AttachmentGallery } from './AttachmentGallery';
import { AttachmentFloatingGallery } from './AttachmentFloatingGallery';
import { AttachmentWhatsAppLink } from './AttachmentWhatsAppLink';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'bg-bosque-800 text-crema rounded-br-sm'
            : 'bg-white text-bosque-800 rounded-bl-sm border border-bosque-100'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.attachments?.map((att, idx) => {
          const key = `${message.id}-att-${idx}`;
          if (att.type === 'image') {
            return <AttachmentImage key={key} url={att.url} caption={att.caption} />;
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
          return <AttachmentWhatsAppLink key={key} url={att.url} label={att.label} />;
        })}
      </div>
    </div>
  );
}
