import { MessageCircle } from 'lucide-react';

interface AttachmentWhatsAppLinkProps {
  url: string;
  label: string;
}

export function AttachmentWhatsAppLink({ url, label }: AttachmentWhatsAppLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1da851]"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
