#!/usr/bin/env python3
"""Simplifica el workflow principal: elimina 3 nodos HTTP a Supabase y reemplaza
Window Memory por Postgres Chat Memory persistente.

Flujo final: Webhook -> Validate -> AI Agent -> Extract Attachments -> Respond
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
            "description": "Muestra una galeria de fotos filtradas por tema. Usala cuando el lead pida ver fotos, imagenes o galeria. Debes determinar el tema: 'volcan' (fotos con volcan al fondo), 'lago' (Lago Colico y alrededores), 'bosque' (bosque nativo), 'atardecer', o 'vista_general' (si no esta claro).",
            "workflowId": {"__rl": True, "value": WF_IDS["galeria"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "tema": "={{ $fromAI('tema', 'Tema de la galeria: volcan | lago | bosque | atardecer | vista_general', 'string') }}"
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
        "position": [920, 520],
    },
    {
        "parameters": {
            "name": "derivar_whatsapp",
            "description": "Genera un link de WhatsApp directo a Diego con contexto pre-cargado. Usalo cuando: (a) el lead explicitamente pide hablar con Diego, (b) hace una pregunta fuera de tu KB que debe responder Diego, (c) pide algo muy especifico (precio de parcela X, disponibilidad). Requiere el motivo (resumen breve de que quiere) y resumen_conversacion (contexto).",
            "workflowId": {"__rl": True, "value": WF_IDS["derivar_whatsapp"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "motivo": "={{ $fromAI('motivo', 'Motivo por el cual el lead quiere hablar con Diego (1 linea)', 'string') }}",
                    "resumen_conversacion": "={{ $fromAI('resumen_conversacion', 'Resumen de la conversacion hasta ahora (2-3 lineas)', 'string') }}"
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
        "position": [1040, 520],
    },
    {
        "parameters": {
            "name": "calificar_lead",
            "description": "Califica y registra al lead en la base de datos. USALA UNA SOLA VEZ POR SESION, cuando tengas al menos: nombre + WhatsApp + 2 de las 3 variables (intencion, plazo, presupuesto). Valores validos: intencion=inversion|segunda_vivienda|vivir_permanente|evaluando|no_definido | plazo=ahora|1_a_3_meses|3_a_6_meses|6_a_12_meses|mas_de_1_ano|no_definido | presupuesto=contado|credito|no_definido. override_caliente=true solo si el lead pide explicitamente 'que me llamen YA'.",
            "workflowId": {"__rl": True, "value": WF_IDS["calificar_lead"], "mode": "id"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "nombre": "={{ $fromAI('nombre', 'Nombre del lead', 'string') }}",
                    "whatsapp": "={{ $fromAI('whatsapp', 'WhatsApp del lead con codigo pais (+56...) o vacio si no se dio', 'string') }}",
                    "email": "={{ $fromAI('email', 'Email del lead o vacio', 'string') }}",
                    "intencion": "={{ $fromAI('intencion', 'Uno de: inversion, segunda_vivienda, vivir_permanente, evaluando, no_definido', 'string') }}",
                    "plazo": "={{ $fromAI('plazo', 'Uno de: ahora, 1_a_3_meses, 3_a_6_meses, 6_a_12_meses, mas_de_1_ano, no_definido', 'string') }}",
                    "presupuesto": "={{ $fromAI('presupuesto', 'Uno de: contado, credito, no_definido', 'string') }}",
                    "resumen_conversacion": "={{ $fromAI('resumen_conversacion', 'Resumen de 2-3 lineas de la conversacion y el interes del lead', 'string') }}",
                    "session_id": "={{ $('Validate Payload').first().json.session_id }}",
                    "override_caliente": "={{ $fromAI('override_caliente', 'true solo si el lead pidio hablar con Diego YA explicitamente', 'boolean') }}"
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
        "position": [1160, 520],
    },
    {
        "parameters": {
            "jsCode": (
                "const agentData = $json;\n"
                "const reply = agentData.output || agentData.text || '';\n"
                "const attachments = [];\n"
                "const steps = agentData.intermediateSteps || [];\n"
                "\n"
                "function pushAttachment(p) {\n"
                "  if (!p || typeof p !== 'object') return;\n"
                "  if (p.type === 'image' && p.url) {\n"
                "    attachments.push({ type: 'image', url: p.url, caption: p.caption });\n"
                "  } else if (p.type === 'gallery' && Array.isArray(p.images)) {\n"
                "    attachments.push({ type: 'gallery', images: p.images });\n"
                "  } else if (p.type === 'whatsapp_link' && p.url) {\n"
                "    attachments.push({ type: 'whatsapp_link', url: p.url, label: p.label || 'Hablar con Diego por WhatsApp' });\n"
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
    "Tool derivar_whatsapp": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
    "Tool calificar_lead": {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]},
}

payload = {
    "name": "Mirador Chat - Main (Simplified)",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"},
}

# Guardar JSON local para versionar
out_path = "/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows/mirador_chat_main_simplified.json"
with open(out_path, "w") as f:
    json.dump(payload, f, indent=2)
print(f"JSON guardado en {out_path}")

print(f"Deactivating {WF_ID}...")
try:
    api("POST", f"/workflows/{WF_ID}/deactivate")
except Exception as e:
    print(f"  deactivate skip: {e}")

print(f"Updating {WF_ID} with simplified flow...")
api("PUT", f"/workflows/{WF_ID}", payload)
print("Update OK")

print(f"Activating {WF_ID}...")
result = api("POST", f"/workflows/{WF_ID}/activate")
print(f"Active: {result.get('active')}")
