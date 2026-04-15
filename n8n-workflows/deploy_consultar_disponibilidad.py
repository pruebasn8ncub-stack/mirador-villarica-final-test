#!/usr/bin/env python3
"""Deploy del sub-workflow consultar_disponibilidad a n8n y actualizar subworkflow_ids."""
import json
import urllib.request
import urllib.error

N8N_BASE = "https://n8n-automind.duckdns.org/api/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDZjNWVhNC0xMDAyLTQxM2MtOTBlZS1kOTg2NzgyYzEwZjUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNWFmM2RiMzAtMWMxMC00M2NjLWJkNmYtNGRiNjg4ZTFjYjAxIiwiaWF0IjoxNzc2MjcyNzE3fQ.ZMGCRHs6RIJtErS2cnDRfIKy3PLBpYcMcc4lab_LuzI"
HEADERS = {"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"}

TOOL_PATH = "/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot/n8n-workflows/tool_consultar_disponibilidad.json"
IDS_PATH = "/tmp/subworkflow_ids.json"


def api(method, path, data=None):
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(f"{N8N_BASE}{path}", data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {err[:500]}")


with open(TOOL_PATH) as f:
    wf = json.load(f)

with open(IDS_PATH) as f:
    ids = json.load(f)

existing_id = ids.get("consultar_disponibilidad")

# n8n API rechaza 'active' en POST/PUT; remover si existe
wf.pop("active", None)
wf.pop("id", None)

# Preparar payload limpio — n8n API solo acepta: name, nodes, connections, settings
payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],
    "connections": wf["connections"],
    "settings": wf.get("settings", {"executionOrder": "v1"}),
}

if existing_id:
    print(f"Updating existing workflow {existing_id}...")
    try:
        api("POST", f"/workflows/{existing_id}/deactivate")
    except Exception as e:
        print(f"  deactivate skip: {e}")
    api("PUT", f"/workflows/{existing_id}", payload)
    result_id = existing_id
    print("Update OK")
else:
    print("Creating new workflow...")
    result = api("POST", "/workflows", payload)
    result_id = result["id"]
    print(f"Created with id {result_id}")

print(f"Activating {result_id}...")
activated = api("POST", f"/workflows/{result_id}/activate")
print(f"Active: {activated.get('active')}")

ids["consultar_disponibilidad"] = result_id
with open(IDS_PATH, "w") as f:
    json.dump(ids, f, indent=2)
print(f"Wrote {IDS_PATH}")
print(json.dumps(ids, indent=2))
