#!/usr/bin/env python3
"""Construir el workflow principal con AI Agent reemplazando el Stub Echo."""
import json
import os
import urllib.request
import urllib.error

N8N_BASE = "https://n8n-automind.duckdns.org/api/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDZjNWVhNC0xMDAyLTQxM2MtOTBlZS1kOTg2NzgyYzEwZjUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNWFmM2RiMzAtMWMxMC00M2NjLWJkNmYtNGRiNjg4ZTFjYjAxIiwiaWF0IjoxNzc2MjcyNzE3fQ.ZMGCRHs6RIJtErS2cnDRfIKy3PLBpYcMcc4lab_LuzI"
HEADERS = {"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"}

with open("/tmp/subworkflow_ids.json") as f:
    WF_IDS = json.load(f)

SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZ2xsZXd5Y3lzY3llbnZxdGVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NDg1MCwiZXhwIjoyMDkxODMwODUwfQ.NuKXzAXPeENkmjxRYpX_5faw5JOP32bvgZRL284dJHI"
SUPABASE_URL = "https://segllewycyscyenvqtes.supabase.co"
OPENROUTER_CRED_ID = "crHqCGLvcnKGMEZi"
WEBHOOK_AUTH_CRED_ID = "IkWeji0O7NPCXFdd"

# Leer system prompt
with open("/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows/system-prompt-v1.md") as f:
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


# ==================== Nodos del workflow principal ====================
nodes = [
    # 1. Webhook entrada
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
    # 2. Validate payload
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
    # 3. Upsert Session
    {
        "parameters": {
            "method": "POST",
            "url": f"{SUPABASE_URL}/rest/v1/sessions",
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "Content-Type", "value": "application/json"},
                    {"name": "Prefer", "value": "resolution=merge-duplicates,return=minimal"},
                    {"name": "apikey", "value": SUPABASE_KEY},
                    {"name": "Authorization", "value": f"Bearer {SUPABASE_KEY}"},
                ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ id: $json.session_id, user_agent: $json.user_metadata?.user_agent ?? null, referrer: $json.user_metadata?.referrer ?? null }) }}",
            "options": {"response": {"response": {"neverError": True}}},
        },
        "id": "supabase-session",
        "name": "Upsert Session",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [680, 300],
    },
    # 4. Save User Message
    {
        "parameters": {
            "method": "POST",
            "url": f"{SUPABASE_URL}/rest/v1/messages",
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "Content-Type", "value": "application/json"},
                    {"name": "Prefer", "value": "return=minimal"},
                    {"name": "apikey", "value": SUPABASE_KEY},
                    {"name": "Authorization", "value": f"Bearer {SUPABASE_KEY}"},
                ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ session_id: $('Validate Payload').first().json.session_id, role: 'user', content: $('Validate Payload').first().json.message }) }}",
            "options": {"response": {"response": {"neverError": True}}},
        },
        "id": "supabase-msg-in",
        "name": "Save User Message",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [900, 300],
    },
    # 5. AI Agent (reemplaza Stub Echo)
    {
        "parameters": {
            "promptType": "define",
            "text": "={{ $('Validate Payload').first().json.message }}",
            "options": {
                "systemMessage": SYSTEM_PROMPT,
                "maxIterations": 5,
            },
        },
        "id": "ai-agent",
        "name": "AI Agent",
        "type": "@n8n/n8n-nodes-langchain.agent",
        "typeVersion": 1.9,
        "position": [1120, 300],
    },
    # 6. Language Model (OpenRouter)
    {
        "parameters": {
            "model": "anthropic/claude-sonnet-4.5",
            "options": {
                "temperature": 0.3,
                "maxTokens": 400,
            },
        },
        "id": "openrouter-model",
        "name": "OpenRouter Model",
        "type": "@n8n/n8n-nodes-langchain.lmChatOpenRouter",
        "typeVersion": 1,
        "position": [1000, 500],
        "credentials": {
            "openRouterApi": {"id": OPENROUTER_CRED_ID, "name": "Mirador OpenRouter"}
        },
    },
    # 7. Memory (Postgres Chat Memory - usa Supabase Postgres)
    # Opción simplificada: Buffer Window Memory sin persistir (se pierde entre turnos).
    # Para persistencia real, habría que configurar Postgres credential. Para MVP usamos buffer window in-memory.
    {
        "parameters": {
            "sessionIdType": "customKey",
            "sessionKey": "={{ $('Validate Payload').first().json.session_id }}",
            "contextWindowLength": 10,
        },
        "id": "memory",
        "name": "Window Memory",
        "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
        "typeVersion": 1.3,
        "position": [1120, 500],
    },
    # 8-11. Tools (sub-workflows expuestos como AI tools)
    {
        "parameters": {
            "name": "mostrar_master_plan",
            "description": "Muestra el master plan (distribución) del proyecto Mirador de Villarrica como imagen. Úsalo cuando el lead pida ver el plano, la distribución, o dónde están ubicadas las parcelas. No requiere parámetros.",
            "workflowId": {"__rl": True, "value": WF_IDS["master_plan"], "mode": "id"},
        },
        "id": "tool-master-plan",
        "name": "Tool mostrar_master_plan",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [1240, 520],
    },
    {
        "parameters": {
            "name": "mostrar_galeria",
            "description": "Muestra una galería de fotos filtradas por tema. Úsala cuando el lead pida ver fotos, imágenes o galería. Debes determinar el tema: 'volcan' (fotos con volcán al fondo), 'lago' (Lago Colico y alrededores), 'bosque' (bosque nativo), 'atardecer', o 'vista_general' (si no está claro).",
            "workflowId": {"__rl": True, "value": WF_IDS["galeria"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "tema": "={{ $fromAI('tema', 'Tema de la galería: volcan | lago | bosque | atardecer | vista_general', 'string') }}"
                },
                "schema": [
                    {"id": "tema", "displayName": "tema", "required": True, "defaultMatch": False, "display": True, "canBeUsedToMatch": True, "type": "string"}
                ]
            },
        },
        "id": "tool-galeria",
        "name": "Tool mostrar_galeria",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [1360, 520],
    },
    {
        "parameters": {
            "name": "derivar_whatsapp",
            "description": "Genera un link de WhatsApp directo a Diego con contexto pre-cargado. Úsalo cuando: (a) el lead explícitamente pide hablar con Diego, (b) hace una pregunta fuera de tu KB que debe responder Diego, (c) pide algo muy específico (precio de parcela X, disponibilidad). Requiere el motivo (resumen breve de qué quiere) y resumen_conversacion (contexto).",
            "workflowId": {"__rl": True, "value": WF_IDS["derivar_whatsapp"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "motivo": "={{ $fromAI('motivo', 'Motivo por el cual el lead quiere hablar con Diego (1 línea)', 'string') }}",
                    "resumen_conversacion": "={{ $fromAI('resumen_conversacion', 'Resumen de la conversación hasta ahora (2-3 líneas)', 'string') }}"
                },
                "schema": [
                    {"id": "motivo", "displayName": "motivo", "required": True, "defaultMatch": False, "display": True, "canBeUsedToMatch": True, "type": "string"},
                    {"id": "resumen_conversacion", "displayName": "resumen_conversacion", "required": True, "defaultMatch": False, "display": True, "canBeUsedToMatch": True, "type": "string"}
                ]
            },
        },
        "id": "tool-derivar",
        "name": "Tool derivar_whatsapp",
        "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
        "typeVersion": 2.2,
        "position": [1480, 520],
    },
    {
        "parameters": {
            "name": "calificar_lead",
            "description": "Califica y registra al lead en la base de datos. ÚSALA UNA SOLA VEZ POR SESIÓN, cuando tengas al menos: nombre + WhatsApp + 2 de las 3 variables (intencion, plazo, presupuesto). Valores válidos: intencion=inversion|segunda_vivienda|vivir_permanente|evaluando|no_definido · plazo=ahora|1_a_3_meses|3_a_6_meses|6_a_12_meses|mas_de_1_ano|no_definido · presupuesto=contado|credito|no_definido. override_caliente=true solo si el lead pide explícitamente 'que me llamen YA'.",
            "workflowId": {"__rl": True, "value": WF_IDS["calificar_lead"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "nombre": "={{ $fromAI('nombre', 'Nombre del lead', 'string') }}",
                    "whatsapp": "={{ $fromAI('whatsapp', 'WhatsApp del lead con código país (+56...) o vacío si no se dio', 'string') }}",
                    "email": "={{ $fromAI('email', 'Email del lead o vacío', 'string') }}",
                    "intencion": "={{ $fromAI('intencion', 'Uno de: inversion, segunda_vivienda, vivir_permanente, evaluando, no_definido', 'string') }}",
                    "plazo": "={{ $fromAI('plazo', 'Uno de: ahora, 1_a_3_meses, 3_a_6_meses, 6_a_12_meses, mas_de_1_ano, no_definido', 'string') }}",
                    "presupuesto": "={{ $fromAI('presupuesto', 'Uno de: contado, credito, no_definido', 'string') }}",
                    "resumen_conversacion": "={{ $fromAI('resumen_conversacion', 'Resumen de 2-3 líneas de la conversación y el interés del lead', 'string') }}",
                    "session_id": "={{ $('Validate Payload').first().json.session_id }}",
                    "override_caliente": "={{ $fromAI('override_caliente', 'true solo si el lead pidió hablar con Diego YA explícitamente', 'boolean') }}"
                },
                "schema": [
                    {"id": "nombre", "type": "string", "required": True, "displayName": "nombre", "defaultMatch": False, "display": True, "canBeUsedToMatch": True},
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
        "position": [1600, 520],
    },
    # 12. Extract attachments from AI Agent response (parsea tool calls output)
    {
        "parameters": {
            "jsCode": (
                "// Parsea la respuesta del AI Agent para extraer reply + attachments.\n"
                "// El AI Agent devuelve `output` con el texto, y cada tool invocada tiene su output\n"
                "// accesible via intermediateSteps. Extraemos attachments de los tools visuales.\n"
                "const agentData = $json;\n"
                "const reply = agentData.output || agentData.text || '';\n"
                "\n"
                "// Buscar attachments en los tool outputs\n"
                "const attachments = [];\n"
                "const steps = agentData.intermediateSteps || [];\n"
                "for (const step of steps) {\n"
                "  const obs = step.observation || step.toolOutput || step;\n"
                "  let parsed = obs;\n"
                "  if (typeof obs === 'string') {\n"
                "    try { parsed = JSON.parse(obs); } catch {}\n"
                "  }\n"
                "  if (parsed && typeof parsed === 'object') {\n"
                "    if (parsed.type === 'image' && parsed.url) {\n"
                "      attachments.push({ type: 'image', url: parsed.url, caption: parsed.caption });\n"
                "    } else if (parsed.type === 'gallery' && Array.isArray(parsed.images)) {\n"
                "      attachments.push({ type: 'gallery', images: parsed.images });\n"
                "    } else if (parsed.type === 'whatsapp_link' && parsed.url) {\n"
                "      attachments.push({ type: 'whatsapp_link', url: parsed.url, label: parsed.label || 'Hablar con Diego por WhatsApp' });\n"
                "    }\n"
                "  }\n"
                "}\n"
                "\n"
                "return [{ json: { reply, attachments } }];"
            )
        },
        "id": "extract-attachments",
        "name": "Extract Attachments",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1340, 300],
    },
    # 13. Save Assistant Message
    {
        "parameters": {
            "method": "POST",
            "url": f"{SUPABASE_URL}/rest/v1/messages",
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "Content-Type", "value": "application/json"},
                    {"name": "Prefer", "value": "return=minimal"},
                    {"name": "apikey", "value": SUPABASE_KEY},
                    {"name": "Authorization", "value": f"Bearer {SUPABASE_KEY}"},
                ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ session_id: $('Validate Payload').first().json.session_id, role: 'assistant', content: $json.reply }) }}",
            "options": {"response": {"response": {"neverError": True}}},
        },
        "id": "supabase-msg-out",
        "name": "Save Assistant Message",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [1560, 300],
    },
    # 14. Respond to Webhook
    {
        "parameters": {
            "respondWith": "json",
            "responseBody": "={{ JSON.stringify({ reply: $('Extract Attachments').first().json.reply, attachments: $('Extract Attachments').first().json.attachments, session_id: $('Validate Payload').first().json.session_id }) }}",
        },
        "id": "respond",
        "name": "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1,
        "position": [1780, 300],
    },
]

connections = {
    "Webhook": {"main": [[{"node": "Validate Payload", "type": "main", "index": 0}]]},
    "Validate Payload": {"main": [[{"node": "Upsert Session", "type": "main", "index": 0}]]},
    "Upsert Session": {"main": [[{"node": "Save User Message", "type": "main", "index": 0}]]},
    "Save User Message": {"main": [[{"node": "AI Agent", "type": "main", "index": 0}]]},
    "AI Agent": {"main": [[{"node": "Extract Attachments", "type": "main", "index": 0}]]},
    "Extract Attachments": {"main": [[{"node": "Save Assistant Message", "type": "main", "index": 0}]]},
    "Save Assistant Message": {"main": [[{"node": "Respond to Webhook", "type": "main", "index": 0}]]},
    # AI sub-connections
    "OpenRouter Model": {"ai_languageModel": [[{"node": "AI Agent", "type": "ai_languageModel", "index": 0}]]},
    "Window Memory": {"ai_memory": [[{"node": "AI Agent", "type": "ai_memory", "index": 0}]]},
    "Tool mostrar_master_plan": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool mostrar_galeria": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool derivar_whatsapp": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool calificar_lead": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
}

payload = {
    "name": "Mirador Chat — Main (AI Agent)",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"},
}

# Guardar JSON local
with open("/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows/mirador_chat_main_agent.json", "w") as f:
    json.dump(payload, f, indent=2)

# Actualizar workflow existente (reemplazar stub por agent)
WF_ID = "II3VLrcHrtsKXMxQ"
print(f"Deactivating {WF_ID}...")
try:
    api("POST", f"/workflows/{WF_ID}/deactivate")
except Exception as e:
    print(f"  deactivate skip: {e}")

print(f"Updating {WF_ID} with AI Agent flow...")
api("PUT", f"/workflows/{WF_ID}", payload)
print("Update OK")

print(f"Activating {WF_ID}...")
result = api("POST", f"/workflows/{WF_ID}/activate")
print(f"Active: {result.get('active')}")
