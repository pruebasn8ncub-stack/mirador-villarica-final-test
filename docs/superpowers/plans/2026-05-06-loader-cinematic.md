# Loader cinemático — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar `components/site/Loader.tsx` con una intro cinematográfica orquestada en GSAP timeline + DrawSVG, que (1) presenta logo Mirador, (2) acredita Terra Segura, (3) dibuja el paisaje (volcán + montañas + pinos + agua), (4) revela la página.

**Architecture:** GSAP 3.15 con plugin DrawSVG para animación line-draw, registrado una sola vez en `lib/gsap.ts`. Componente cliente con `useGSAP()` para auto-cleanup. Storyboard composado en `LoaderScene.tsx` con 4 SVG components inline (placeholders ahora, swap por assets de Recraft después). Trigger una vez por sesión vía `sessionStorage` versionado.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind 3.4, GSAP 3.15.0, @gsap/react 2.1.2, DrawSVGPlugin (incluido en npm gsap free).

**Spec de referencia:** `docs/superpowers/specs/2026-05-06-loader-cinematic-design.md`

**Working directory para todos los comandos:**
```
/home/hugo/Escritorio/proyectos/busqueda de proyectos/mirador-villarrica-chatbot
```

---

## File Structure

**Crear:**
- `lib/gsap.ts` — registra plugins una vez, re-exporta `gsap`
- `components/site/loader/VolcanoSvg.tsx` — SVG inline del volcán con paths `data-draw`
- `components/site/loader/MountainsSvg.tsx` — SVG inline de montañas
- `components/site/loader/TreesSvg.tsx` — SVG inline de pinos
- `components/site/loader/WaterSvg.tsx` — SVG inline de agua
- `components/site/loader/LoaderScene.tsx` — compone los 4 SVGs + foto atmosférica + logos

**Modificar:**
- `components/site/Loader.tsx` — reescritura completa con GSAP timeline, sessionStorage, skip button, reduced-motion

**No tocar:**
- `app/layout.tsx` (sigue usando `<Loader />` igual)
- Cualquier otro componente

**Después (manual, fuera del plan):**
- Generar 4 SVGs en Recraft con los prompts del spec, descargar a `public/assets/loader/`
- Pegar paths en los 4 componentes SVG reemplazando los placeholders

---

## Verificación general

Este proyecto **no tiene framework de testing** (no jest/vitest configurado). La verificación es:

1. `pnpm typecheck` — validación estática de TypeScript
2. `pnpm dev` y abrir `http://localhost:3000` — smoke test visual manual
3. DevTools Application → Storage → Session Storage → borrar `mirador:loader-v2` para forzar replay
4. DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"
5. DevTools → Device toolbar para mobile <480px

---

## Task 1: Configurar registro central de GSAP

**Files:**
- Create: `lib/gsap.ts`

- [ ] **Step 1: Crear archivo `lib/gsap.ts`**

Contenido completo:

```ts
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

export { gsap, DrawSVGPlugin };
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores. Si falla con "Cannot find module 'gsap/DrawSVGPlugin'", verificar que `gsap@3.15.0` está instalado (`grep gsap package.json`).

- [ ] **Step 3: Commit**

```bash
git add lib/gsap.ts
git commit -m "feat(loader): add central GSAP plugin registration"
```

---

## Task 2: Crear VolcanoSvg con paths placeholder

**Files:**
- Create: `components/site/loader/VolcanoSvg.tsx`

- [ ] **Step 1: Crear archivo `components/site/loader/VolcanoSvg.tsx`**

Contenido completo:

```tsx
type Props = { className?: string };

export function VolcanoSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        data-draw="volcano"
        d="M 70 140 L 95 50 L 100 47 L 105 50 L 130 140 Z"
      />
      <path
        data-draw="volcano"
        d="M 88 70 L 95 60 L 100 65 L 105 58 L 110 68 L 112 70"
      />
      <path
        data-draw="volcano"
        d="M 100 47 Q 102 38 100 30 Q 96 22 102 16"
        strokeWidth="1"
        opacity="0.7"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/site/loader/VolcanoSvg.tsx
git commit -m "feat(loader): add VolcanoSvg component with placeholder line-art"
```

---

## Task 3: Crear MountainsSvg con paths placeholder

**Files:**
- Create: `components/site/loader/MountainsSvg.tsx`

- [ ] **Step 1: Crear archivo `components/site/loader/MountainsSvg.tsx`**

Contenido completo:

```tsx
type Props = { className?: string };

export function MountainsSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 600 140"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path data-draw="mountain" d="M 0 140 L 50 90 L 90 110 L 130 95 L 170 105 L 200 100 Z" opacity="0.55" />
      <path data-draw="mountain" d="M 180 140 L 230 80 L 270 100 L 310 70 L 350 95 L 400 88 Z" opacity="0.7" />
      <path data-draw="mountain" d="M 380 140 L 420 95 L 460 110 L 500 90 L 540 100 L 580 92 L 600 100 L 600 140 Z" opacity="0.6" />
      <path data-draw="mountain" d="M 60 140 L 110 70 L 145 90 L 180 65 L 220 90 L 250 80 Z" />
      <path data-draw="mountain" d="M 290 140 L 340 60 L 375 85 L 410 55 L 450 80 L 480 70 Z" />
    </svg>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/site/loader/MountainsSvg.tsx
git commit -m "feat(loader): add MountainsSvg component with placeholder line-art"
```

---

## Task 4: Crear TreesSvg con paths placeholder

**Files:**
- Create: `components/site/loader/TreesSvg.tsx`

- [ ] **Step 1: Crear archivo `components/site/loader/TreesSvg.tsx`**

Contenido completo:

```tsx
type Props = { className?: string };

export function TreesSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 100"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path data-draw="tree" d="M 60 100 L 60 60 M 50 70 L 60 60 L 70 70 M 47 80 L 60 67 L 73 80 M 44 90 L 60 75 L 76 90" />
      <path data-draw="tree" d="M 130 100 L 130 50 M 117 62 L 130 50 L 143 62 M 113 75 L 130 58 L 147 75 M 109 88 L 130 67 L 151 88" />
      <path data-draw="tree" d="M 230 100 L 230 65 M 222 73 L 230 65 L 238 73 M 219 82 L 230 70 L 241 82 M 216 92 L 230 78 L 244 92" />
      <path data-draw="tree" d="M 320 100 L 320 55 M 308 65 L 320 55 L 332 65 M 304 78 L 320 62 L 336 78 M 300 90 L 320 70 L 340 90" />
    </svg>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/site/loader/TreesSvg.tsx
git commit -m "feat(loader): add TreesSvg component with placeholder line-art"
```

---

## Task 5: Crear WaterSvg con paths placeholder

**Files:**
- Create: `components/site/loader/WaterSvg.tsx`

- [ ] **Step 1: Crear archivo `components/site/loader/WaterSvg.tsx`**

Contenido completo:

```tsx
type Props = { className?: string };

export function WaterSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 600 60"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path data-draw="water" d="M 0 15 Q 50 5 100 15 T 200 15 T 300 15 T 400 15 T 500 15 T 600 15" opacity="0.7" />
      <path data-draw="water" d="M 0 35 Q 50 25 100 35 T 200 35 T 300 35 T 400 35 T 500 35 T 600 35" opacity="0.55" />
      <path data-draw="water" d="M 0 50 Q 50 42 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50" opacity="0.4" />
    </svg>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/site/loader/WaterSvg.tsx
git commit -m "feat(loader): add WaterSvg component with placeholder line-art"
```

---

## Task 6: Crear LoaderScene composando capas

**Files:**
- Create: `components/site/loader/LoaderScene.tsx`

- [ ] **Step 1: Crear archivo `components/site/loader/LoaderScene.tsx`**

Contenido completo:

```tsx
import Image from 'next/image';
import { VolcanoSvg } from './VolcanoSvg';
import { MountainsSvg } from './MountainsSvg';
import { TreesSvg } from './TreesSvg';
import { WaterSvg } from './WaterSvg';

type Props = {
  miradorRef: React.RefObject<HTMLDivElement>;
  tsRef: React.RefObject<HTMLDivElement>;
  dividerRef: React.RefObject<HTMLDivElement>;
  sceneRef: React.RefObject<HTMLDivElement>;
  photoRef: React.RefObject<HTMLDivElement>;
};

export function LoaderScene({ miradorRef, tsRef, dividerRef, sceneRef, photoRef }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div
        ref={photoRef}
        className="absolute inset-0 opacity-0"
        style={{ filter: 'blur(8px)' }}
        aria-hidden="true"
      >
        <Image
          src="/assets/banner-volcan.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bosque-950/90 via-bosque-950/70 to-bosque-950/95" />
      </div>

      <div
        ref={sceneRef}
        className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
        aria-hidden="true"
      >
        <WaterSvg className="absolute inset-x-0 bottom-0 w-full h-[12%] hidden sm:block" />
        <TreesSvg className="absolute inset-x-0 bottom-[8%] w-full h-[18%] hidden sm:block" />
        <MountainsSvg className="absolute inset-x-0 bottom-[6%] w-full h-[60%]" />
        <VolcanoSvg className="absolute left-1/2 -translate-x-1/2 bottom-[6%] h-[80%] w-auto" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
        <div ref={miradorRef} className="opacity-0">
          <Image
            src="/assets/mirador-logo-amarillo.png"
            alt="Mirador de Villarrica"
            width={320}
            height={320}
            priority
            className="size-32 sm:size-44 object-contain"
          />
        </div>

        <div ref={dividerRef} className="h-px w-32 sm:w-40 bg-mostaza/50 origin-center" />

        <div ref={tsRef} className="opacity-0 flex flex-col items-center gap-2">
          <span className="text-[9px] tracking-[0.4em] uppercase text-crema/55 font-sans">
            Por
          </span>
          <Image
            src="/assets/terra-segura-logo.webp"
            alt="Terra Segura"
            width={240}
            height={60}
            priority
            className="h-6 sm:h-8 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/site/loader/LoaderScene.tsx
git commit -m "feat(loader): compose loader scene with logos, volcano, mountains, trees, water"
```

---

## Task 7: Reescribir Loader.tsx con GSAP timeline

**Files:**
- Modify: `components/site/Loader.tsx` (reescritura completa)

- [ ] **Step 1: Reemplazar contenido completo de `components/site/Loader.tsx`**

Borrar todo el contenido actual y reemplazar con:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { LoaderScene } from './loader/LoaderScene';

const SHOWN_KEY = 'mirador:loader-v2';
const MAX_DURATION_MS = 6500;

export function Loader() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);
  const [skipVisible, setSkipVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const miradorRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    setMounted(true);

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1';
    } catch {
      // sessionStorage may be unavailable in privacy mode; fall through with show=true
    }
    if (alreadyShown) {
      setShow(false);
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem(SHOWN_KEY, '1');
    } catch {
      // ignore
    }
    setShow(false);
    document.body.style.overflow = '';
  };

  useGSAP(
    () => {
      if (!show || !mounted) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([miradorRef.current, tsRef.current, dividerRef.current], { autoAlpha: 1 });
        gsap.set(sceneRef.current, { autoAlpha: 0 });
        const tl = gsap.timeline({ onComplete: finish });
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.2 })
          .to({}, { duration: 0.6 })
          .to(containerRef.current, { autoAlpha: 0, duration: 0.4 });
        timelineRef.current = tl;
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: finish,
        });

        tl.fromTo(overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: 'power2.in' }
        )
          .fromTo(miradorRef.current,
            { scale: 0.6, filter: 'blur(20px)', autoAlpha: 0 },
            { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
            0.2
          )
          .fromTo(dividerRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5 },
            1.6
          )
          .fromTo(tsRef.current,
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7 },
            '<'
          )
          .to(photoRef.current,
            { autoAlpha: 0.15, duration: 1.2 },
            2.4
          )
          .fromTo('[data-draw="mountain"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 1.0, stagger: 0.15, ease: 'power1.inOut' },
            2.6
          )
          .fromTo('[data-draw="volcano"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.9, ease: 'power2.out' },
            '-=0.6'
          )
          .fromTo('[data-draw="tree"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.6, stagger: 0.1 },
            '-=0.5'
          )
          .fromTo('[data-draw="water"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.7, stagger: 0.08 },
            '-=0.4'
          )
          .to([miradorRef.current, tsRef.current, dividerRef.current],
            { y: -40, scale: 0.9, autoAlpha: 0.7, duration: 0.6 },
            3.8
          )
          .to(overlayRef.current,
            {
              background: 'linear-gradient(180deg, #071410 0%, rgba(7,20,16,0.4) 50%, #faf6ee 100%)',
              duration: 0.8,
            },
            '<'
          )
          .to(containerRef.current,
            { autoAlpha: 0, duration: 0.6 },
            4.4
          );

        timelineRef.current = tl;

        gsap.fromTo(skipRef.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.5, delay: 1.5,
            onStart: () => setSkipVisible(true),
          }
        );
      });

      const failsafe = window.setTimeout(finish, MAX_DURATION_MS);
      return () => window.clearTimeout(failsafe);
    },
    { scope: containerRef, dependencies: [show, mounted] }
  );

  const handleSkip = () => {
    timelineRef.current?.totalProgress(1);
  };

  if (!mounted || !show) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100]">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-bosque-950"
        style={{ opacity: 0 }}
      />
      <LoaderScene
        miradorRef={miradorRef}
        tsRef={tsRef}
        dividerRef={dividerRef}
        sceneRef={sceneRef}
        photoRef={photoRef}
      />
      <button
        ref={skipRef}
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 text-[10px] tracking-[0.3em] uppercase text-crema/60 hover:text-mostaza transition-colors"
        style={{ opacity: 0 }}
        aria-label="Saltar intro"
        tabIndex={skipVisible ? 0 : -1}
      >
        Saltar →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: Sin errores. Si TypeScript se queja de `drawSVG` como propiedad, agregar al inicio del archivo (antes de imports):

```ts
/// <reference types="gsap" />
```

Si TypeScript se queja del tipo del callback de `useGSAP`, asegurar que la firma cierra el closure devolviendo void/cleanup correctamente.

- [ ] **Step 3: Smoke test manual — primera visita**

Run: `pnpm dev` (servidor en `http://localhost:3000`)

Abrir DevTools → Application → Storage → Session Storage → `http://localhost:3000` → borrar `mirador:loader-v2` si existe.

Recargar la página. Verificar visualmente:
- Aparece overlay verde bosque oscuro
- Logo Mirador entra con scale + blur out (~1.2s)
- Aparece divider + logo Terra Segura abajo
- Empiezan a dibujarse montañas, volcán, pinos, líneas de agua (DrawSVG)
- Los logos suben + escalan abajo
- Overlay transiciona a gradiente con crema en la base
- Loader desaparece, página visible

- [ ] **Step 4: Smoke test manual — segunda visita**

Sin borrar el sessionStorage, recargar la página.
Expected: el loader NO aparece, la página se ve directo.

- [ ] **Step 5: Smoke test manual — fail-safe**

En el componente, comentar temporalmente `setShow(false)` dentro de `finish` para simular un timeline que no termina. Recargar tras borrar sessionStorage.
Expected: a los 6.5s el loader igual desaparece (window.setTimeout fail-safe).

Restaurar el código.

- [ ] **Step 6: Smoke test manual — skip button**

Borrar sessionStorage. Recargar. Esperar a que aparezca "Saltar →" (a los ~1.5s en la esquina inferior derecha). Click.
Expected: el timeline acelera al final y el loader desaparece inmediato.

- [ ] **Step 7: Smoke test manual — reduced motion**

DevTools → Cmd/Ctrl+Shift+P → "Show Rendering" → en panel: "Emulate CSS media feature prefers-reduced-motion" → "reduce".
Borrar sessionStorage. Recargar.
Expected: fade simple sin DrawSVG, sin transformaciones complejas, ~1.2s total.

- [ ] **Step 8: Smoke test manual — mobile <480px**

DevTools → Device toolbar → resolución 375px de ancho.
Borrar sessionStorage. Recargar.
Expected: pinos y líneas de agua están ocultas (`hidden sm:block` los esconde por debajo de 640px breakpoint Tailwind por default; verificar que el detalle se simplifica). Logos y volcán + montañas siguen visibles.

- [ ] **Step 9: Commit**

```bash
git add components/site/Loader.tsx
git commit -m "feat(loader): rewrite Loader with GSAP timeline + DrawSVG line-draw"
```

---

## Task 8: Validar bundle size y build

- [ ] **Step 1: Build de producción**

Run: `pnpm build`
Expected: build exitoso, sin errores de TypeScript ni de compilación.

- [ ] **Step 2: Inspeccionar tamaño del bundle**

En la salida de `pnpm build`, ubicar la línea correspondiente a `/` (ruta home). Anotar el tamaño total.

- [ ] **Step 3: Probar build de producción localmente**

Run: `pnpm start` (en otra terminal o tras matar `pnpm dev`)
Abrir `http://localhost:3000`. Borrar sessionStorage. Recargar.
Expected: el loader corre igual que en dev, sin warnings en consola.

- [ ] **Step 4: Commit (si hay cambios pendientes)**

Si los smoke tests detectaron ajustes (timing, easing) y los aplicaste, hacer commit:

```bash
git add components/site/Loader.tsx
git commit -m "fix(loader): tune timing after manual smoke test"
```

Si no hubo cambios, saltear este step.

---

## Task 9: (Opcional, post-implementación) Reemplazar SVGs placeholder por assets de Recraft

**Solo ejecutar después de generar los SVGs en recraft.ai.** Los prompts están en el spec: `docs/superpowers/specs/2026-05-06-loader-cinematic-design.md`, sección "Assets — prompts para Recraft".

**Files:**
- Modify: `components/site/loader/VolcanoSvg.tsx`
- Modify: `components/site/loader/MountainsSvg.tsx`
- Modify: `components/site/loader/TreesSvg.tsx`
- Modify: `components/site/loader/WaterSvg.tsx`
- Add: `public/assets/loader/villarrica-volcano.svg`
- Add: `public/assets/loader/mountain-range.svg`
- Add: `public/assets/loader/pine-trees.svg`
- Add: `public/assets/loader/water-waves.svg`

- [ ] **Step 1: Generar los 4 SVGs en recraft.ai**

Ir a [recraft.ai](https://recraft.ai), elegir Vector mode + Line Art preset. Pegar el primer prompt (volcán) del spec. Descargar `.svg`. Para los siguientes, usar "Generate in this style" para mantener consistency. Descargar todos.

- [ ] **Step 2: Guardar los archivos descargados**

```bash
mkdir -p public/assets/loader
mv ~/Downloads/villarrica-volcano.svg public/assets/loader/
mv ~/Downloads/mountain-range.svg public/assets/loader/
mv ~/Downloads/pine-trees.svg public/assets/loader/
mv ~/Downloads/water-waves.svg public/assets/loader/
```

- [ ] **Step 3: Inspeccionar cada SVG**

Abrir cada `.svg` en un editor. Verificar:
- Los `path` tienen atributo `stroke` (no solo `fill`). Si solo tienen `fill`, DrawSVG no funcionará — pasar el archivo por [SVGOMG](https://jakearchibald.github.io/svgomg/) y/o convertir manualmente fills a strokes.
- Los `path` están separados por elemento (volcán: cono + cima nevada + humo en paths distintos para animar por separado).

- [ ] **Step 4: Reemplazar el contenido de VolcanoSvg.tsx**

Copiar los `<path>` del archivo `villarrica-volcano.svg` y pegar dentro del componente, reemplazando los paths placeholder. Agregar `data-draw="volcano"` a cada path. Mantener el wrapping `<svg>` con `viewBox`, `stroke="#f4a84b"`, `fill="none"`, `aria-hidden`.

- [ ] **Step 5: Repetir Step 4 para MountainsSvg, TreesSvg, WaterSvg**

`data-draw="mountain"` a cada path de montañas, `data-draw="tree"` a pinos, `data-draw="water"` a las líneas de agua.

- [ ] **Step 6: Smoke test manual completo**

Borrar sessionStorage. Recargar. Verificar que el line-draw se ve nítido y matchea el estilo del logo.

- [ ] **Step 7: Commit**

```bash
git add components/site/loader public/assets/loader
git commit -m "feat(loader): replace placeholder SVGs with Recraft-generated line-art"
```

---

## Self-Review (ya ejecutado al escribir el plan)

**Spec coverage:**

| Sección del spec | Task que la implementa |
|---|---|
| Storyboard 5 escenas | Task 7 (timeline GSAP completo) |
| Timeline GSAP estructura | Task 7 |
| Loader.tsx responsabilidades | Task 7 (sessionStorage, scroll lock, useGSAP, matchMedia, skip) |
| LoaderScene.tsx responsabilidades | Task 6 (composición + foto atmosférica) |
| 4 SVG components con data-draw | Tasks 2, 3, 4, 5 |
| `lib/gsap.ts` registro plugins | Task 1 |
| Reduced motion | Task 7, Step 1 (matchMedia branch) |
| Skip button | Task 7, Step 1 (skipRef + handleSkip) |
| Mobile responsive | Task 6 (clases `hidden sm:block` en water/trees) |
| Fail-safe 6.5s | Task 7, Step 1 (`MAX_DURATION_MS` + `setTimeout`) |
| sessionStorage versionado `mirador:loader-v2` | Task 7, Step 1 |
| Reglas de aceptación 1-8 | Cubiertas en Tasks 7-8 verificación manual |
| Assets Recraft | Task 9 (opcional, post-implementación) |

**Placeholder scan:** sin TBD, TODO, o "implement later". Cada step tiene código completo o comando exacto.

**Type consistency:** los nombres `miradorRef`, `tsRef`, `dividerRef`, `sceneRef`, `photoRef`, `skipRef`, `containerRef`, `overlayRef`, `timelineRef` consistentes entre Tasks 6 (props de LoaderScene) y 7 (refs en Loader). El selector `[data-draw="mountain|volcano|tree|water"]` es consistente con los atributos puestos en Tasks 2-5. La key `SHOWN_KEY = 'mirador:loader-v2'` matchea la spec.
