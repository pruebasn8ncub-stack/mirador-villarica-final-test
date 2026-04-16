export type Role = 'user' | 'assistant';

export type Attachment =
  | { type: 'image'; url: string; caption?: string }
  | { type: 'image_floating'; url: string; caption?: string; title?: string }
  | { type: 'gallery'; images: { url: string; alt: string }[] }
  | { type: 'gallery_floating'; images: { url: string; alt?: string }[]; caption?: string }
  | { type: 'whatsapp_link'; url: string; label: string };

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  user_metadata?: {
    referrer?: string;
    user_agent?: string;
  };
}

export interface ChatResponse {
  reply: string;
  attachments?: Attachment[];
  session_id: string;
}

export interface ChatErrorResponse {
  error: string;
  code?: 'rate_limit' | 'validation' | 'upstream' | 'unknown';
}
