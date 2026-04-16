#!/usr/bin/env python3
"""Build and deploy the main Mirador chatbot workflow.

Flow: Webhook -> Validate -> AI Agent -> Extract Attachments -> Respond
Tools: mostrar_master_plan, mostrar_galeria, consultar_disponibilidad,
       enviar_brochure, calificar_lead
"""
import json
import urllib.request
import urllib.error

N8N_BASE = "https://n8n-automind.duckdns.org/api/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDZjNWVhNC0xMDAyLTQxM2MtOTBlZS1kOTg2NzgyYzEwZjUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNWFmM2RiMzAtMWMxMC00M2NjLWJkNmYtNGRiNjg4ZTFjYjAxIiwiaWF0IjoxNzc2MjcyNzE3fQ.ZMGCRHs6RIJtErS2cnDRfIKy3PLBpYcMcc4lab_LuzI"
HEADERS = {"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"}

WF_ID = "II3VLrcHrtsKXMxQ"
POSTGRES_CRED_ID = "gKtQrCdcY2E8edN4"
OPENROUTER_CRED_ID = "crHqCGLvcnKGMEZi"
WEBHOOK_AUTH_CRED_ID = "IkWeji0O7NPCXFdd"

with open("/tmp/subworkflow_ids.json") as f:
    WF_IDS = json.load(f)

with open("/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows/system-prompt-v2.md") as f:
    SYSTEM_PROMPT = f.read()


def api(method, path, data=None):
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(f"{N8N_BASE}{path}", data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {err[:500]}")


nodes = [
    {
        "parameters": {
            "httpMethod": "POST",
            "path": "mirador-chat",
            "responseMode": "responseNode",
            "authentication": "headerAuth",
            "options": {},
        },
        "id": "webhook-in",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 2,
        "position": [240, 300],
        "webhookId": "mirador-chat",
        "credentials": {
            "httpHeaderAuth": {"id": WEBHOOK_AUTH_CRED_ID, "name": "Mirador Webhook Bearer"}
        },
    },
    {
        "parameters": {
            "jsCode": (
                "const item = $input.first().json;\n"
                "const body = item.body ?? item;\n"
                "const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n"
                "if (!body || typeof body !== 'object') throw new Error('Invalid body');\n"
                "if (typeof body.session_id !== 'string' || !uuidRe.test(body.session_id)) throw new Error('Invalid session_id');\n"
                "if (typeof body.message !== 'string' || body.message.length === 0 || body.message.length > 1000) throw new Error('Invalid message');\n"
                "return [{ json: {\n"
                "  session_id: body.session_id,\n"
                "  message: body.message,\n"
                "  user_metadata: body.user_metadata ?? null,\n"
                "  received_at: new Date().toISOString(),\n"
                "} }];"
            )
        },
        "id": "validate",
        "name": "Validate Payload",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [460, 300],
    },
    {
        "parameters": {
            "promptType": "define",
            "text": "={{ $('Validate Payload').first().json.message }}",
            "options": {
                "systemMessage": SYSTEM_PROMPT,
                "maxIterations": 5,
                "returnIntermediateSteps": True,
            },
        },
        "id": "ai-agent",
        "name": "AI Agent",
        "type": "@n8n/n8n-nodes-langchain.agent",
        "typeVersion": 1.9,
        "position": [680, 300],
    },
    {
        "parameters": {
            "model": "openai/gpt-oss-120b:free",
            "options": {
                "temperature": 0.3,
                "maxTokens": 400,
            },
        },
        "id": "openrouter-model",
        "name": "OpenRouter Model",
        "type": "@n8n/n8n-nodes-langchain.lmChatOpenRouter",
        "typeVersion": 1,
        "position": [560, 500],
        "credentials": {
            "openRouterApi": {"id": OPENROUTER_CRED_ID, "name": "Mirador OpenRouter"}
        },
    },
    {
        "parameters": {
            "sessionIdType": "customKey",
            "sessionKey": "={{ $('Validate Payload').first().json.session_id }}",
            "tableName": "mirador_chat_history",
            "contextWindowLength": 10,
        },
        "id": "postgres-memory",
        "name": "Postgres Chat Memory",
        "type": "@n8n/n8n-nodes-langchain.memoryPostgresChat",
        "typeVersion": 1.3,
        "position": [680, 500],
        "credentials": {
            "postgres": {"id": POSTGRES_CRED_ID, "name": "Mirador Supabase Postgres"}
        },
    },
    # ── Tools ──────────────────────────────────────────────────────────
    {
        "parameters": {
            "name": "mostrar_master_plan",
            "description": "Muestra el master plan (distribucion) del proyecto Mirador de Villarrica como imagen. Usalo cuando el lead pida ver el plano, la distribucion, o donde estan ubicadas las parcelas. No requiere parametros.",
            "workflowId": {"__rl": True, "value": WF_IDS["master_plan"], "mode": "id"},
        },
        "id": "tool-master-plan",
        "name": "Tool mostrar_master_plan",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [800, 520],
    },
    {
        "parameters": {
            "name": "mostrar_galeria",
            "description": "Abre una galeria flotante en el widget con 6 fotos del entorno del proyecto. Usala cuando el lead pida ver fotos, imagenes, galeria o quiera conocer el entorno/paisaje. No requiere parametros. La galeria se abre automaticamente en el widget - solo avisa al lead que ya la abriste y describe brevemente lo que vera.",
            "workflowId": {"__rl": True, "value": WF_IDS["galeria"], "mode": "id"},
        },
        "id": "tool-galeria",
        "name": "Tool mostrar_galeria",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [920, 520],
    },
    {
        "parameters": {
            "name": "consultar_disponibilidad",
            "description": "Consulta el inventario EN VIVO (Google Sheet publico de Terra Segura, 94 parcelas). Devuelve tanto parcelas individuales como resumenes agregados (por tramo de precio, tamano, sector, destacadas) para que puedas razonar como un vendedor. Usala cuando el lead pregunte por: precios o disponibilidad por parcela, que entra en su presupuesto, tamanos especificos, parcelas destacadas, o para saber que hay disponible en general. SIEMPRE llamala antes de afirmar precio o disponibilidad. Parametros (TODOS opcionales): numero='1'..'74' o 'B1'..'B20' para busqueda puntual; estado='disponible'|'reservado'|'vendido'|'todos' (default disponible); tamano_min/tamano_max en m2 (0=sin limite); presupuesto_contado_max o presupuesto_credito_max en CLP (0=sin limite); sector='numeradas'|'lote_b'|'todas'; solo_destacadas=true para parcelas con estrella; orden='destacadas_primero' (default) | 'precio_asc' | 'precio_desc' | 'tamano_asc' | 'tamano_desc'; max_resultados entre 1 y 200 (default 5; pasa 100 o 200 para obtener el listado COMPLETO del inventario).",
            "workflowId": {"__rl": True, "value": WF_IDS["consultar_disponibilidad"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "numero": "={{ $fromAI('numero', \"SIEMPRE inclui este campo. Numero de parcela especifica: '1'..'74' o 'B1'..'B20' si buscas una parcela puntual; si no, pasa string vacio ''.\", 'string') }}",
                    "estado": "={{ $fromAI('estado', \"Estado buscado: 'disponible' (default), 'reservado', 'vendido' o 'todos'.\", 'string') }}",
                    "tamano_min": "={{ $fromAI('tamano_min', 'Tamano minimo en m2. 0 = sin limite.', 'number') }}",
                    "tamano_max": "={{ $fromAI('tamano_max', 'Tamano maximo en m2. 0 = sin limite.', 'number') }}",
                    "presupuesto_contado_max": "={{ $fromAI('presupuesto_contado_max', 'Presupuesto maximo contado en CLP. 0 = sin limite.', 'number') }}",
                    "presupuesto_credito_max": "={{ $fromAI('presupuesto_credito_max', 'Presupuesto maximo credito (valor total) en CLP. 0 = sin limite.', 'number') }}",
                    "sector": "={{ $fromAI('sector', \"Sector: 'numeradas' (1-74), 'lote_b' (B1-B20) o 'todas' (default).\", 'string') }}",
                    "solo_destacadas": "={{ $fromAI('solo_destacadas', 'true para mostrar solo parcelas destacadas (estrella).', 'boolean') }}",
                    "orden": "={{ $fromAI('orden', \"Orden del resultado: 'destacadas_primero' (default), 'precio_asc' (mas baratas primero), 'precio_desc' (mas caras primero), 'tamano_asc' o 'tamano_desc'.\", 'string') }}",
                    "max_resultados": "={{ $fromAI('max_resultados', 'Cantidad maxima de parcelas a devolver (1-200, default 5; pasa 100 o 200 para recibir el listado COMPLETO del inventario y poder razonar sobre todo).', 'number') }}"
                },
                "schema": [
                    {"id": "numero", "type": "string", "required": True, "displayName": "numero", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "estado", "type": "string", "required": True, "displayName": "estado", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "tamano_min", "type": "number", "required": True, "displayName": "tamano_min", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "tamano_max", "type": "number", "required": True, "displayName": "tamano_max", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "presupuesto_contado_max", "type": "number", "required": True, "displayName": "presupuesto_contado_max", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "presupuesto_credito_max", "type": "number", "required": True, "displayName": "presupuesto_credito_max", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "sector", "type": "string", "required": True, "displayName": "sector", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "solo_destacadas", "type": "boolean", "required": True, "displayName": "solo_destacadas", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "orden", "type": "string", "required": True, "displayName": "orden", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "max_resultados", "type": "number", "required": True, "displayName": "max_resultados", "defaultMatch": False, "display": True, "canBeUsedToMatch": True}
                ]
            },
        },
        "id": "tool-consultar-disponibilidad",
        "name": "Tool consultar_disponibilidad",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [1040, 520],
    },
    {
        "parameters": {
            "name": "enviar_brochure",
            "description": "Envia al lead el brochure PDF + inventario detallado en vivo + una recomendacion personalizada por WhatsApp o correo electronico. Usala cuando el lead acepte recibir el material. IMPORTANTE: antes de llamarla DEBES haber llamado consultar_disponibilidad al menos una vez en la conversacion para poder hacer la recomendacion. El parametro 'recomendacion' debe ser un texto personalizado de 2-4 oraciones que conecte lo que sabes del lead (intencion, plazo, presupuesto, tamano buscado) con 2-3 parcelas concretas del inventario (numeros, precios, destacadas). Requiere: canal (whatsapp|email) + contacto + nombre + recomendacion.",
            "workflowId": {"__rl": True, "value": WF_IDS["enviar_brochure"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "canal": "={{ $fromAI('canal', \"Canal de envio: 'whatsapp' o 'email'\", 'string') }}",
                    "contacto": "={{ $fromAI('contacto', 'Numero de telefono (con codigo pais +56...) si canal es whatsapp, o direccion de correo electronico si canal es email', 'string') }}",
                    "nombre": "={{ $fromAI('nombre', 'Nombre del lead para personalizar el envio', 'string') }}",
                    "recomendacion": "={{ $fromAI('recomendacion', 'Texto personalizado de 2-4 oraciones con tu recomendacion para este lead, basada en lo que sabes de el (intencion, plazo, presupuesto, tamano) y en las parcelas concretas del inventario que viste al llamar consultar_disponibilidad. Menciona 2-3 numeros de parcela especificos, precio y por que calzan con su perfil. Ej: \"Considerando su interes por inversion con presupuesto contado hasta $20M, le recomiendo especialmente las parcelas destacadas 9 y 16, ambas de 5.000 m2 con 17% de descuento ($14.49M contado). Si busca mas tamano, la parcela 47 de 10.000 m2 a $21.99M es una muy buena opcion premium.\"', 'string') }}"
                },
                "schema": [
                    {"id": "canal", "type": "string", "required": True, "displayName": "canal", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "contacto", "type": "string", "required": True, "displayName": "contacto", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "nombre", "type": "string", "required": True, "displayName": "nombre", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "recomendacion", "type": "string", "required": True, "displayName": "recomendacion", "defaultMatch": False, "display": True, "canBeUsedToMatch": True}
                ]
            },
        },
        "id": "tool-enviar-brochure",
        "name": "Tool enviar_brochure",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [1160, 520],
    },
    {
        "parameters": {
            "name": "calificar_lead",
            "description": "Califica y registra al lead en la base de datos. USALA UNA SOLA VEZ POR SESION, cuando tengas al menos: nombre + algun dato de contacto (whatsapp o email) + 2 de las 3 variables (intencion, plazo, presupuesto). Valores validos: intencion=inversion|segunda_vivienda|vivir_permanente|evaluando|no_definido | plazo=ahora|1_a_3_meses|3_a_6_meses|6_a_12_meses|mas_de_1_ano|no_definido | presupuesto=contado|credito|no_definido. override_caliente=true solo si el lead pide explicitamente hablar con alguien del equipo YA.",
            "workflowId": {"__rl": True, "value": WF_IDS["calificar_lead"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "nombre": "={{ $fromAI('nombre', 'Nombre del lead', 'string') }}",
                    "apellido": "={{ $fromAI('apellido', 'Apellido del lead o vacio si no se dio', 'string') }}",
                    "whatsapp": "={{ $fromAI('whatsapp', 'WhatsApp del lead con codigo pais (+56...) o vacio si no se dio', 'string') }}",
                    "email": "={{ $fromAI('email', 'Email del lead o vacio si no se dio', 'string') }}",
                    "intencion": "={{ $fromAI('intencion', 'Uno de: inversion, segunda_vivienda, vivir_permanente, evaluando, no_definido', 'string') }}",
                    "plazo": "={{ $fromAI('plazo', 'Uno de: ahora, 1_a_3_meses, 3_a_6_meses, 6_a_12_meses, mas_de_1_ano, no_definido', 'string') }}",
                    "presupuesto": "={{ $fromAI('presupuesto', 'Uno de: contado, credito, no_definido', 'string') }}",
                    "resumen_conversacion": "={{ $fromAI('resumen_conversacion', 'Resumen de 2-3 lineas de la conversacion y el interes del lead', 'string') }}",
                    "session_id": "={{ $('Validate Payload').first().json.session_id }}",
                    "override_caliente": "={{ $fromAI('override_caliente', 'true solo si el lead pidio hablar con alguien del equipo YA explicitamente', 'boolean') }}"
                },
                "schema": [
                    {"id": "nombre", "type": "string", "required": True, "displayName": "nombre", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "apellido", "type": "string", "required": False, "displayName": "apellido", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "whatsapp", "type": "string", "required": False, "displayName": "whatsapp", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "email", "type": "string", "required": False, "displayName": "email", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "intencion", "type": "string", "required": True, "displayName": "intencion", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "plazo", "type": "string", "required": True, "displayName": "plazo", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "presupuesto", "type": "string", "required": True, "displayName": "presupuesto", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "resumen_conversacion", "type": "string", "required": True, "displayName": "resumen_conversacion", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "session_id", "type": "string", "required": True, "displayName": "session_id", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
                    {"id": "override_caliente", "type": "boolean", "required": False, "displayName": "override_caliente", "defaultMatch": False, "display": True, "canBeUsedToMatch": True}
                ]
            },
        },
        "id": "tool-calificar",
        "name": "Tool calificar_lead",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [1280, 520],
    },
    # ── Post-processing ────────────────────────────────────────────────
    {
        "parameters": {
            "jsCode": (
                "const agentData = $json;\n"
                "let reply = (agentData.output || agentData.text || '').toString();\n"
                "// Sanitize: remove zero-width chars (modelo free a veces los emite)\n"
                "reply = reply.replace(/[\\u200B-\\u200D\\uFEFF\\u2060]/g, '');\n"
                "reply = reply.replace(/\\s{3,}/g, ' ').trim();\n"
                "if (reply.length < 3) {\n"
                "  reply = 'Te comparto la informacion solicitada.';\n"
                "}\n"
                "const attachments = [];\n"
                "const steps = agentData.intermediateSteps || [];\n"
                "\n"
                "function pushAttachment(p) {\n"
                "  if (!p || typeof p !== 'object') return;\n"
                "  if (p.type === 'image' && p.url) {\n"
                "    attachments.push({ type: 'image', url: p.url, caption: p.caption });\n"
                "  } else if (p.type === 'image_floating' && p.url) {\n"
                "    attachments.push({ type: 'image_floating', url: p.url, caption: p.caption, title: p.title });\n"
                "  } else if (p.type === 'gallery' && Array.isArray(p.images)) {\n"
                "    attachments.push({ type: 'gallery', images: p.images });\n"
                "  } else if (p.type === 'gallery_floating' && Array.isArray(p.images)) {\n"
                "    attachments.push({ type: 'gallery_floating', images: p.images, caption: p.caption });\n"
                "  } else if (p.type === 'whatsapp_link' && p.url) {\n"
                "    attachments.push({ type: 'whatsapp_link', url: p.url, label: p.label || 'Hablar con equipo de ventas por WhatsApp' });\n"
                "  }\n"
                "}\n"
                "\n"
                "for (const step of steps) {\n"
                "  const obs = step.observation ?? step.toolOutput ?? step;\n"
                "  let parsed = obs;\n"
                "  if (typeof obs === 'string') {\n"
                "    try { parsed = JSON.parse(obs); } catch { continue; }\n"
                "  }\n"
                "  if (Array.isArray(parsed)) {\n"
                "    for (const item of parsed) {\n"
                "      const unwrapped = item && item.json ? item.json : item;\n"
                "      pushAttachment(unwrapped);\n"
                "    }\n"
                "  } else {\n"
                "    const unwrapped = parsed && parsed.json ? parsed.json : parsed;\n"
                "    pushAttachment(unwrapped);\n"
                "  }\n"
                "}\n"
                "return [{ json: { reply, attachments } }];"
            )
        },
        "id": "extract-attachments",
        "name": "Extract Attachments",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [900, 300],
    },
    {
        "parameters": {
            "respondWith": "json",
            "responseBody": "={{ JSON.stringify({ reply: $('Extract Attachments').first().json.reply, attachments: $('Extract Attachments').first().json.attachments, session_id: $('Validate Payload').first().json.session_id }) }}",
        },
        "id": "respond",
        "name": "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1,
        "position": [1120, 300],
    },
]

connections = {
    "Webhook": {"main": [[{"node": "Validate Payload", "type": "main", "index": 0}]]},
    "Validate Payload": {"main": [[{"node": "AI Agent", "type": "main", "index": 0}]]},
    "AI Agent": {"main": [[{"node": "Extract Attachments", "type": "main", "index": 0}]]},
    "Extract Attachments": {"main": [[{"node": "Respond to Webhook", "type": "main", "index": 0}]]},
    "OpenRouter Model": {"ai_languageModel": [[{"node": "AI Agent", "type": "ai_languageModel", "index": 0}]]},
    "Postgres Chat Memory": {"ai_memory": [[{"node": "AI Agent", "type": "ai_memory", "index": 0}]]},
    "Tool mostrar_master_plan": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool mostrar_galeria": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool consultar_disponibilidad": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool enviar_brochure": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool calificar_lead": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
}

payload = {
    "name": "Mirador Chat - Main (Simplified)",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"},
}

# Save local JSON for version control
out_path = "/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows/mirador_chat_main_simplified.json"
with open(out_path, "w") as f:
    json.dump(payload, f, indent=2)
print(f"JSON guardado en {out_path}")

print(f"Deactivating {WF_ID}...")
try:
    api("POST", f"/workflows/{WF_ID}/deactivate")
except Exception as e:
    print(f"  deactivate skip: {e}")

print(f"Updating {WF_ID} with updated flow...")
api("PUT", f"/workflows/{WF_ID}", payload)
print("Update OK")

print(f"Activating {WF_ID}...")
result = api("POST", f"/workflows/{WF_ID}/activate")
print(f"Active: {result.get('active')}")
