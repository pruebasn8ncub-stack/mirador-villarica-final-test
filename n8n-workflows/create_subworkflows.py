#!/usr/bin/env python3
"""Crear los 5 sub-workflows en n8n y activar. Guarda IDs en /tmp/subworkflow_ids.json."""
import json
import urllib.request
import os

N8N_BASE = "https://n8n-automind.duckdns.org/api/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDZjNWVhNC0xMDAyLTQxM2MtOTBlZS1kOTg2NzgyYzEwZjUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNWFmM2RiMzAtMWMxMC00M2NjLWJkNmYtNGRiNjg4ZTFjYjAxIiwiaWF0IjoxNzc2MjcyNzE3fQ.ZMGCRHs6RIJtErS2cnDRfIKy3PLBpYcMcc4lab_LuzI"
HEADERS = {"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"}
WF_DIR = "/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows"


def api_post(path, data):
    req = urllib.request.Request(
        f"{N8N_BASE}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers=HEADERS,
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def api_put(path, data):
    req = urllib.request.Request(
        f"{N8N_BASE}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers=HEADERS,
        method="PUT",
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def activate(wf_id):
    req = urllib.request.Request(
        f"{N8N_BASE}/workflows/{wf_id}/activate", headers=HEADERS, method="POST"
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def load_wf(filename):
    with open(os.path.join(WF_DIR, filename)) as f:
        wf = json.load(f)
    return {
        "name": wf["name"],
        "nodes": wf["nodes"],
        "connections": wf["connections"],
        "settings": wf.get("settings", {"executionOrder": "v1"}),
    }


def create_wf(filename):
    payload = load_wf(filename)
    try:
        result = api_post("/workflows", payload)
        return {"id": result["id"], "name": result["name"]}
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR {e.code}: {body[:200]}")
        return None


# 1. Crear los 4 independientes
independent = [
    ("tool_mostrar_master_plan.json", "master_plan"),
    ("tool_mostrar_galeria.json", "galeria"),
    ("tool_derivar_whatsapp.json", "derivar_whatsapp"),
    ("tool_notificar_diego.json", "notificar_diego"),
]

ids = {}
for filename, key in independent:
    print(f"Creating {key}...")
    wf = create_wf(filename)
    if wf:
        ids[key] = wf["id"]
        print(f"  -> {wf['id']} ({wf['name']})")
    else:
        print(f"  FAILED")

# 2. Para calificar_lead necesitamos reemplazar el placeholder con el ID real de notificar_diego
if "notificar_diego" in ids:
    print("Creating calificar_lead (with notificar_diego reference)...")
    payload = load_wf("tool_calificar_lead.json")
    for node in payload["nodes"]:
        if node["type"] == "n8n-nodes-base.executeWorkflow":
            node["parameters"]["workflowId"]["value"] = ids["notificar_diego"]
    try:
        result = api_post("/workflows", payload)
        ids["calificar_lead"] = result["id"]
        print(f"  -> {result['id']}")
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.read().decode()[:200]}")

# 3. Activar todos
for key, wf_id in ids.items():
    try:
        result = activate(wf_id)
        print(f"Activated {key} ({wf_id}): active={result.get('active')}")
    except urllib.error.HTTPError as e:
        print(f"Activate {key} error: {e.read().decode()[:200]}")

# 4. Guardar IDs
with open("/tmp/subworkflow_ids.json", "w") as f:
    json.dump(ids, f, indent=2)

print("\n=== IDs ===")
print(json.dumps(ids, indent=2))
