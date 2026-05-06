# Loader cinemático — Mirador de Villarrica

**Fecha:** 2026-05-06
**Estado:** Diseño aprobado, listo para plan de implementación
**Componente afectado:** `components/site/Loader.tsx` (reescritura completa)
**Stack nuevo:** GSAP 3.15.0 + @gsap/react 2.1.2 + DrawSVG plugin
**Stack existente:** Next.js 14 App Router, React 18, Framer Motion 11 (queda para el resto del sitio), Tailwind 3.4

## Objetivo

Reemplazar el loader actual (Framer Motion, fade simple con logo) por una intro cinematográfica que (1) presente Mirador de Villarrica como marca, (2) acredite a Terra Segura como desarrollador, (3) construya el paisaje del proyecto (volcán + montañas + pinos) con animación line-draw, y (4) revele la página con una transición elegante. Tono: lujo discreto tipo Lagom / Mersi Architecture, no narrativo-ilustrado.

## Decisiones de diseño

### Por qué GSAP en vez de seguir con Framer Motion

Framer Motion ya está instalado y se usa en todo el sitio. **No lo reemplazamos** — sigue manejando reveals, hovers, scroll-triggers en el resto. Solo el loader migra a GSAP por tres razones:

1. **Timeline imperativo con position parameters** (`'<'`, `'-=0.5'`) hace trivial coreografiar 5 escenas con 10+ keyframes sincronizados al milisegundo. Framer Motion sufre con esto: termina como un árbol de `delay`s frágiles.
2. **Plugin DrawSVG** anima el `stroke-dashoffset` para dibujar paths como si los trazara una mano. Es el efecto core de la sensación premium del loader. Framer Motion no lo tiene nativo.
3. **AI Skill oficial** (`greensock/gsap-skills`) está instalada — Claude Code, Cursor, Codex generan código GSAP correcto sin alucinar APIs.

Costo: +25KB al bundle, solo se carga en el componente Loader (lazy import si hace falta optimizar más).

### Por qué Recraft V4 Vector para los assets

El logo de Mirador es line-art amarillo (`#f4a84b`) con stroke fino sobre fondo verde bosque. Necesitamos extender ese mismo lenguaje visual a un volcán, montañas y pinos para la escena que se construye. Tres opciones evaluadas:

| Opción | Veredicto |
|---|---|
| Hand-coded SVG | Descartado: el primer intento (mockups en companion) salió pobre, no replica autoridad de trazo del logo |
| Recraft V4 Vector | **Elegido** — único generador AI text-to-SVG **nativo** con style consistency entre generaciones |
| Spline 3D + AI | Descartado — choca con el flat line-art del logo, +200KB bundle |
| Midjourney/Flux raster | Descartado — output PNG no anima con DrawSVG, no escala como vector |

Recraft no se integra al pipeline de build: los SVGs se generan manualmente en recraft.ai con prompts dirigidos (incluidos abajo) y se commitean en `public/assets/loader/`.

## Storyboard

5 escenas, ~5.0 segundos totales (timing exacto ajustable durante implementación). Tiempos absolutos desde t=0:

| # | Tiempo | Escena | Mecánica |
|---|---|---|---|
| 1 | 0.0–0.6s | Fade in del overlay | `overlay opacity 0 → 1`, ease `power2.in` |
| 2 | 0.2–1.4s | Logo Mirador entra y enfoca | `scale 0.6 → 1`, `blur 20px → 0`, `autoAlpha 0 → 1`, ease `power3.out` |
| 3 | 1.6–2.6s | Divider + logo Terra Segura aparecen | Divider `scaleX 0 → 1` + TS logo `y 16 → 0`, fade in escalonado |
| 4 | 2.6–4.4s | Paisaje se dibuja (DrawSVG) | Montañas en stagger 0.15s → volcán → pinos en stagger 0.1s → líneas de agua |
| 5 | 3.8–5.0s | Reveal de la página | Logos `y -40, scale 0.9, autoAlpha 0.7` + overlay gradiente a crema + fade del root |

La foto `banner-volcan.jpg` aparece como capa atmosférica de fondo desde la escena 4 con `opacity 0.15` y `blur(8px)` — aporta profundidad fotográfica detrás del line art.

## Timeline GSAP (estructura final)

```ts
const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
  .fromTo(miradorLogo,
    { scale: 0.6, filter: 'blur(20px)', autoAlpha: 0 },
    { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
    0.2)
  .fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 1.6)
  .fromTo(tsLogo, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, '<')
  .fromTo(photoLayer, { autoAlpha: 0 }, { autoAlpha: 0.15, duration: 1.2 }, 2.4)
  .fromTo('[data-draw="mountain"]',
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: 1.0, stagger: 0.15, ease: 'power1.inOut' },
    2.6)
  .fromTo('[data-draw="volcano"]',
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: 0.9, ease: 'power2.out' },
    '-=0.6')
  .fromTo('[data-draw="tree"]',
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: 0.6, stagger: 0.1 },
    '-=0.5')
  .fromTo('[data-draw="water"]',
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: 0.7, stagger: 0.08 },
    '-=0.4')
  .to([miradorLogo, tsLogo, divider],
    { y: -40, scale: 0.9, autoAlpha: 0.7, duration: 0.6 },
    3.8)
  .to(overlay,
    { background: 'linear-gradient(180deg, #071410 0%, rgba(7,20,16,0.4) 50%, #faf6ee 100%)',
      duration: 0.8 }, '<')
  .to(loaderRoot,
    { autoAlpha: 0, duration: 0.6, onComplete: handleComplete },
    4.4);
```

## Arquitectura

```
components/site/
  Loader.tsx           ← cliente, hook useGSAP, manejo de sessionStorage + scroll lock
  LoaderScene.tsx      ← componente que renderiza los SVGs importados con data-draw atributos
  loader/
    VolcanoSvg.tsx     ← <svg> wrapping del .svg de Recraft, paths con data-draw="volcano"
    MountainsSvg.tsx   ← idem, paths con data-draw="mountain"
    TreesSvg.tsx       ← idem, paths con data-draw="tree"
    WaterSvg.tsx       ← idem, paths con data-draw="water"

public/assets/loader/
  villarrica-volcano.svg   ← generado en Recraft
  mountain-range.svg       ← generado en Recraft
  pine-trees.svg           ← generado en Recraft
  water-waves.svg          ← generado en Recraft
```

### Loader.tsx — responsabilidades

- Marca `'use client'` (Framer Motion no participa, GSAP es client-only).
- `useGSAP({ scope: containerRef })` para auto-cleanup en unmount.
- Registra `DrawSVGPlugin` una sola vez (módulo top-level).
- `sessionStorage` flag `mirador:loader-v2` (versionado para forzar replay si redseñamos).
- Lee `prefers-reduced-motion` con `gsap.matchMedia()` y devuelve un timeline alterno (fade simple 600ms).
- `document.body.style.overflow = 'hidden'` mientras se muestra; cleanup garantizado.
- Botón "Saltar →" en esquina inferior derecha que aparece a los 1.5s (`autoAlpha 0 → 1`); su click llama `tl.totalProgress(1)` para acelerar la salida.
- Window-load: el timeline arranca en `useGSAP`; el cierre real espera `Promise.race([timelineDone, maxTimeout])` con `maxTimeout = 6000ms` como fail-safe.

### LoaderScene.tsx — responsabilidades

- Renderiza `VolcanoSvg`, `MountainsSvg`, `TreesSvg`, `WaterSvg` posicionados en absolute layers (z-index ordenado: water atrás, montañas medias, volcán al frente, pinos delante).
- Acepta `aria-hidden="true"` por default — el loader es decorativo.
- Foto atmosférica como `<Image src="/assets/banner-volcan.jpg" />` con `opacity-0` inicial (GSAP la lleva a 0.15).

## Trigger y comportamiento

| Aspecto | Valor |
|---|---|
| Frecuencia | Una vez por sesión del navegador (`sessionStorage`) |
| Duración mínima | ~5.0s (timeline completo) |
| Duración máxima | 6.5s (fail-safe absoluto) |
| Espera | Window-load Y timeline mínimo |
| Scroll lock | `document.body.style.overflow = 'hidden'` |
| Prefers-reduced-motion | Fade simple 600ms, sin DrawSVG ni cinemática |
| Skip | Botón "Saltar →" a partir de 1.5s, click → `tl.totalProgress(1)` |
| Mobile (<480px) | Pinos y water-waves se ocultan; volcán + montañas + logos quedan |
| SSR | Componente devuelve `null` en server (mounted check) |

## Assets — prompts para Recraft

Workflow: ir a [recraft.ai](https://recraft.ai), elegir **Vector** mode, **Line Art** style preset. Generar el primer asset; usar "Generate in this style" para los siguientes. Color stroke `#F4A84B`, no fill, fondo transparente. Descargar como `.svg` y commitear en `public/assets/loader/`.

### villarrica-volcano.svg

```
Minimalist single-line illustration of Villarrica volcano, perfect symmetric
cone shape with snow zigzag pattern on the upper third, two thin smoke wisps
rising from the peak, geometric line art style, mustard yellow #F4A84B stroke
1.5px, no fill, transparent background, similar aesthetic to a brand logo
mark
```

### mountain-range.svg

```
Distant mountain range silhouette with five layered peaks of varying heights,
horizontal panoramic composition, minimal single-line geometric style, mustard
yellow stroke 1.2px, no fill, transparent background, matching the previous
Villarrica volcano illustration style — same line weight, same hand
```

### pine-trees.svg

```
Three stylized pine trees of varying heights arranged horizontally, simple
triangle stack pattern with central vertical trunk lines, minimalist line art,
mustard yellow stroke 1.2px, no fill, transparent background, matching the
geometric line art style of the volcano illustration
```

### water-waves.svg

```
Three horizontal wavy lines representing a calm lake surface, minimalist line
art with soft sinusoidal curves, mustard yellow stroke 1px, no fill,
transparent background, matching the established line art style of the
mountain and volcano illustrations
```

## Reglas de aceptación

1. La intro se ejecuta solo en la primera visita por sesión y no vuelve a aparecer al navegar entre páginas.
2. Tiempo total visible al usuario está entre ~5.0s (mínimo natural del timeline) y 6.5s (fail-safe absoluto).
3. El botón "Saltar →" cierra el loader inmediatamente cuando se clickea.
4. En modo `prefers-reduced-motion`, no hay DrawSVG ni transformaciones — solo fade in/out de 600ms con los logos centrados.
5. En mobile <480px, la composición se simplifica: solo logos + volcán + montañas. Pinos y water-waves se ocultan vía Tailwind responsive.
6. Sin layout shift en la página principal cuando el loader desaparece.
7. `tsc --noEmit` pasa sin errores.
8. El bundle de la home no aumenta más de 30KB después de optimización (gsap core 25KB + DrawSVG 4KB + componente).

## Fuera de alcance

- Personalización del loader por landing/sub-ruta (es global).
- Variantes A/B del loader.
- Telemetría de impresión / skip-rate del loader.
- Pre-loading de assets de la home más allá de `priority` en imágenes existentes.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| DrawSVG falla porque los paths Recraft tienen `fill` y no `stroke` | Verificar al importar; pasar los SVGs por SVGOMG si es necesario; documentar en el README del componente que paths deben ser stroke-only |
| `gsap.registerPlugin` se llama múltiples veces en HMR | Registro top-level del módulo, fuera del componente — corre una vez por bundle |
| `sessionStorage` no disponible (privacy mode) | Try/catch silencioso, fallback a no-flag (loader corre cada vez en sesión) |
| Foto `banner-volcan.jpg` se ve granulada al hacer blur | Probar a `0.15` opacity + `blur(8px)`; si igual molesta, usar gradient sin foto |
| GSAP DrawSVG aún requiere `gsap-trial` en algún edge case | Confirmado: GSAP es 100% free desde Webflow acquisition (2024). El paquete `gsap` en npm trae todos los plugins. |
| Bundle aumenta y empuja LCP de la home | Lazy import del componente Loader; el código GSAP solo carga al cliente y solo en primera visita por sesión |

## Roadmap de implementación (alto nivel — el plan detallado lo escribe writing-plans)

1. Generar los 4 SVGs en Recraft, descargar, commitear en `public/assets/loader/`.
2. Convertir cada SVG en componente React (`VolcanoSvg.tsx`, etc.) con `data-draw` attrs en cada path animable.
3. Reescribir `Loader.tsx` con `useGSAP` + DrawSVGPlugin + timeline.
4. Crear `LoaderScene.tsx` que monta los componentes SVG + foto atmosférica.
5. Agregar `gsap.matchMedia()` para reduced-motion + responsive (oculta pinos/water en <480px).
6. Smoke test manual: primera visita, segunda visita (no aparece), reduced-motion, mobile, skip button, ancho del bundle.
7. `pnpm typecheck` debe pasar.

## Anexo: comandos ejecutados durante la fase de setup

```bash
# Ya ejecutados:
pnpm add gsap @gsap/react
npx -y skills add https://github.com/greensock/gsap-skills --agent claude-code --yes --global

# Pendientes (parte del plan de implementación):
# (no requiere instalar nada más — Recraft es una web app externa)
```
