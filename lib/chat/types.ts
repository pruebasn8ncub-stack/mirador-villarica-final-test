export type Role = 'user' | 'assistant';

export interface PropertyCarouselItem {
  parcela: string;
  sqm: string;
  price: string;
  image?: string;
  tone?: string;
}

export interface CompareRow {
  rol: string;
  sqm: string;
  view: string;
  price: string;
  highlight?: boolean;
}

export interface NearbyPlace {
  place: string;
  minutes: number;
}

export type LeadFormField = 'nombre' | 'email' | 'whatsapp' | 'cuando';

export type PropertyCta = { label: string; action: string };

export type Attachment =
  | { type: 'image'; url: string; caption?: string }
  | { type: 'image_floating'; url: string; caption?: string; title?: string }
  | { type: 'gallery'; images: { url: string; alt: string }[] }
  | { type: 'gallery_floating'; images: { url: string; alt?: string }[]; caption?: string }
  | { type: 'whatsapp_link'; url: string; label: string }
  | {
      type: 'property_card';
      parcela: string;
      sqm: string;
      price: string;
      image?: string;
      features?: string[];
      ctas?: PropertyCta[];
      status?: string;
    }
  | { type: 'property_carousel'; items: PropertyCarouselItem[] }
  | { type: 'compare_table'; rows: CompareRow[] }
  | {
      type: 'map_card';
      lat?: number;
      lng?: number;
      address?: string;
      title?: string;
      subtitle?: string;
      nearbyMinutes?: NearbyPlace[];
      embedUrl?: string;
    }
  | {
      type: 'mortgage_simulator';
      priceClp?: number;
      priceUf?: number;
      defaultDownPct?: number;
      defaultMonths?: number;
    }
  | { type: 'brochure_card'; url: string; title?: string; pages?: number; sizeKb?: number }
  | { type: 'video_card'; url: string; thumb?: string; title?: string; duration?: string }
  | { type: 'lead_form'; prompt?: string; fields?: LeadFormField[] }
  | {
      type: 'handoff';
      advisorName?: string;
      advisorRole?: string;
      whatsapp?: string;
      message?: string;
    };

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface LeadGateData {
  nombre: string;
  whatsapp: string;
  email: string;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  user_metadata?: {
    referrer?: string;
    user_agent?: string;
    lead?: LeadGateData;
    first_message?: boolean;
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
