# Mirador de Villarrica — Chatbot embebido (MVP Fase 1)

Réplica funcional del sitio `miradordevillarrica.cl` con widget de chat embebido conectado a un agente IA orquestado en n8n. Cliente: **Agencia Palena** (proyecto interno para Terra Segura Inmobiliaria).

## Stack

- Next.js 14 (App Router) + TypeScript estricto
- Tailwind CSS + Framer Motion + lucide-react
- React Hook Form + Zod (validación)
- n8n (orquestación) — VPS automind
- Supabase Cloud (persistencia)
- OpenRouter (Claude Sonnet 4.6) vía AI Agent node de n8n — Wave 2
- Evolution API (notificación a Diego) — Wave 2

## Estructura

```
mirador-villarrica-chatbot/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── chat/route.ts      # Proxy al webhook n8n
│       └── cotizar/route.ts   # Form tradicional (backup)
├── components/
│   ├── site/                  # 9 secciones del sitio réplica
│   └── chat/                  # Widget conversacional
├── lib/
│   ├── chat/                  # types, storage, api
│   └── utils.ts               # cn()
├── data/content.ts            # KB estructurada (fuente: brochure)
├── public/
│   ├── assets/                # 11 imágenes del proyecto
│   └── brochure/              # PDF oficial
├── supabase/migrations/       # Schema SQL Fase 1
└── n8n-workflows/             # JSON de workflows (stub + finales)
```

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local
# Editar .env.local con tus credenciales (ver sección Env)
pnpm dev
```

Abrir http://localhost:3000.

### Modo mocks

Si no tienes el backend n8n corriendo, activa mocks para probar el widget UI:

```bash
NEXT_PUBLIC_CHAT_MOCKS=1 pnpm dev
```

El widget responderá con mocks que incluyen imagen (master plan), galería (fotos) y link WhatsApp.

## Variables de entorno

### Frontend (Vercel)

| Variable | Descripción |
|---|---|
| `N8N_WEBHOOK_URL` | URL del webhook principal en n8n |
| `N8N_WEBHOOK_TOKEN` | Bearer token del header Auth del webhook |
| `N8N_COTIZAR_WEBHOOK_URL` | (opcional) Webhook dedicado al form tradicional |
| `NEXT_PUBLIC_CHAT_MOCKS` | `1` para activar mocks en desarrollo |

### Backend (n8n credentials — NO en Vercel)

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase Cloud |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `OPENROUTER_API_KEY` | API key de OpenRouter (Claude Sonnet 4.6) |
| `EVOLUTION_API_URL` | `http://187.127.11.156:8080` |
| `EVOLUTION_API_KEY` | API key Evolution |
| `EVOLUTION_INSTANCE` | Instancia dedicada (p. ej. `mirador-villarrica-notif`) |
| `DIEGO_WHATSAPP` | **Desarrollo:** `56992533044` (Hugo). **Go-live:** `56940329987` (Diego) |

## Deploy

### Supabase

```bash
# Desde la carpeta supabase/ correr el SQL del archivo de migración en el SQL Editor
# o con CLI:
supabase db push --linked
```

### Vercel

Auto-deploy desde `main`. Configurar env vars en el dashboard antes del primer deploy.

### n8n

1. Importar `n8n-workflows/mirador_chat_main_stub.json` en la instancia del VPS automind
2. Configurar credencial `Supabase Mirador` con service_role key
3. Configurar credencial Header Auth en el webhook con el mismo token que `N8N_WEBHOOK_TOKEN` en Vercel
4. Activar workflow

En Wave 2 se importan los workflows finales (AI Agent + 5 sub-workflows).

## Checklist de go-live con Palena

- [ ] Confirmar con Palena si precio crédito $17.490.000 aplica a parcela base ($11.990.000) o a otra
- [ ] Confirmar instancia Evolution API dedicada (nueva) o compartida (existing VPS)
- [ ] Cambiar `DIEGO_WHATSAPP` de `56992533044` a `56940329987` en env vars
- [ ] Probar 10 escenarios E2E (ver spec §9.4)
- [ ] Grabar demo para Palena
- [ ] Transferir repo y credenciales a Palena si corresponde

## Referencias

- Spec completo: [`docs/superpowers/specs/2026-04-15-mirador-villarrica-chatbot-design.md`](../docs/superpowers/specs/2026-04-15-mirador-villarrica-chatbot-design.md)
- Plan de implementación: [`.claude/plans/drifting-mixing-pie.md`](~/.claude/plans/drifting-mixing-pie.md)
- Sitio original: https://miradordevillarrica.cl
- Tour 360°: https://lanube360.com/mirador-de-villarrica/
