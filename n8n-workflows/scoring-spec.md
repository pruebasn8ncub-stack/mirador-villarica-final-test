# Scoring Spec — BANT+ para Mirador Villarrica

Versión: 1.0 · 2026-04-20
Plan: `/home/hugo/.claude/plans/analizemos-el-flujo-que-zany-aurora.md`

## Objetivo

Calificar leads entrantes al chatbot usando un score numérico 0-100 derivado de 6 señales (BANT expandido). El broker humano solo debe atender leads que completaron perfil y superan cierto umbral, o que explícitamente pidieron handoff.

## Fuente de verdad

- `leads.score_numeric` (int 0-100): **la verdad**.
- `leads.score` (text: CALIENTE/TIBIO/FRIO): **etiqueta derivada** por umbrales.
- `leads.score_history` (jsonb[]): auditoría cronológica de cambios.

## Pesos (total 100 pts)

| Señal | Peso | Valor → puntos |
|---|---:|---|
| **plazo** | 25 | `ahora`=25, `1_a_3_meses` o `1-3m` o `inmediato`=22, `3_a_6_meses` o `3-6m`=15, `6_a_12_meses` o `6-12m`=8, `mas_de_1_ano` o `12m+`=3, `no_definido`=0 |
| **rango_presupuesto** | 25 | `>60M`=25, `40-60M`=22, `20-40M`=18, `<20M`=10, `no_definido`=0 |
| **forma_pago** | 15 | `contado`=15, `credito` con `pre_aprobacion=true`=14, `credito`=10, `mixto`=10, `subsidio`=6, `no_definido`=0 |
| **uso** | 15 | `inversion`=15, `segunda`=13, `vivienda`=10, `no_definido`=0 |
| **decisor** | 10 | `solo`=10, `pareja`=8, `familia`=5, `no_definido`=0 |
| **contacto** | 10 | `whatsapp && email`=10, (`whatsapp` XOR `email`)=7, solo `nombre`=3, nada=0 |

Fuente conceptual: BANT modificado (Budget/Authority/Need/Timeline) con "use case" + "contactability" — adaptación B2C inmobiliario para parcelas/segundas viviendas.

## Derivación de etiqueta

| score_numeric | score text |
|---|---|
| ≥ 70 | `CALIENTE` |
| 40 – 69 | `TIBIO` |
| < 40 | `FRIO` |

## Override handoff

Cuando el lead invoca `solicitar_broker`:
- `score_numeric = GREATEST(score_numeric_actual, 75)`
- `score = 'CALIENTE'`
- `broker_requested_at = now()`

## Datos mínimos para invocar `calificar_lead`

El bot solo debe llamar `calificar_lead` cuando se cumplan TODAS estas condiciones. Mientras tanto, usa `actualizar_datos_lead` para persistencia incremental.

**Obligatorio:**
- `nombre` (no vacío)
- `whatsapp` O `email`
- **Al menos 3 de 4** entre: `plazo`, `rango_presupuesto` (o `presupuesto`), `forma_pago`, `uso`

**Bonus (suman puntos pero no son obligatorios):**
- `decisor`
- `pre_aprobacion` (si `forma_pago='credito'`)

Si faltan datos mínimos → `calificar_lead` retorna `{ ok: false, reason: 'faltan_datos', faltantes: [...] }` y el bot sigue conversando.

## Acciones en `score_history`

Cada entrada es un objeto con `{ at: ISO-8601, action: string, ...payload }`:

| action | payload | Quién lo escribe |
|---|---|---|
| `gate_submit` | `{ source: 'form', plazo, score_numeric }` | `/api/lead-gate` |
| `partial_update` | `{ fields_updated: [...] }` | `tool_actualizar_datos_lead` |
| `final_score` | `{ score_numeric, score_label, weights_applied: {...} }` | `tool_calificar_lead` |
| `broker_requested` | `{ motivo, contexto }` | `tool_solicitar_broker` |

## Notificación al broker

- `tool_calificar_lead` **NO** notifica automáticamente (cambio vs. v1).
- `tool_solicitar_broker` **siempre** notifica vía `tool_notificar_diego` con `motivo` y `contexto` enriquecidos.
- Se actualiza `leads.last_notified_score` para tracking; futuras iteraciones pueden decidir re-notificar si score sube.

## Umbrales de referencia (para análisis posterior)

- **CALIENTE típico real:** contacto completo + plazo ≤ 3m + presupuesto ≥ 20M + forma de pago definida → ~75-90 pts.
- **TIBIO típico:** contacto + plazo 3-12m + presupuesto o forma de pago definida → ~45-65 pts.
- **FRIO típico:** plazo >12m o indefinido + falta presupuesto → ~15-35 pts.

## Mapeo de valores legacy (compatibilidad v1)

Las tools legacy usaban `intencion` en vez de `uso` y valores libres en `presupuesto`. Mapping para conservar data existente:

| Legacy field | Legacy value | BANT+ campo destino | BANT+ valor |
|---|---|---|---|
| `intencion` | `inversion` | `uso` | `inversion` |
| `intencion` | `segunda_vivienda` | `uso` | `segunda` |
| `intencion` | `vivir_permanente` | `uso` | `vivienda` |
| `intencion` | `evaluando`, `no_definido` | `uso` | `no_definido` |
| `presupuesto` | `contado` | `forma_pago` | `contado` |
| `presupuesto` | `credito` | `forma_pago` | `credito` |
| `presupuesto` | `no_definido` | `forma_pago` | `no_definido` |

Nota: `presupuesto` legacy mezclaba "forma de pago" con "rango". En v2 se separan. El `rango_presupuesto` se captura nuevo (no hay retrocompatibilidad, leads antiguos quedan con `rango_presupuesto=NULL`).
