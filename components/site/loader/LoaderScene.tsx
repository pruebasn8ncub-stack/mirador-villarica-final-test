import Image from 'next/image';
import type { RefObject } from 'react';
import { VolcanoSvg } from './VolcanoSvg';
import { TreesSvg } from './TreesSvg';

type Props = {
  miradorRef: RefObject<HTMLDivElement>;
  tsRef: RefObject<HTMLDivElement>;
  dividerRef: RefObject<HTMLDivElement>;
  sceneRef: RefObject<HTMLDivElement>;
  logosRef: RefObject<HTMLDivElement>;
};

export function LoaderScene({ miradorRef, tsRef, dividerRef, sceneRef, logosRef }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div
        ref={sceneRef}
        className="absolute inset-x-0 bottom-0 h-[34%] sm:h-[36%] pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <TreesSvg className="absolute inset-x-0 bottom-[6%] w-full h-[42%]" />
        <VolcanoSvg className="absolute left-1/2 -translate-x-1/2 bottom-[6%] h-[78%] w-auto" />
      </div>

      <div
        ref={logosRef}
        className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 -translate-y-[12%] sm:-translate-y-[14%]"
      >
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

        <div ref={tsRef} className="opacity-0 flex flex-col items-center gap-2.5">
          <span className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-crema/60 font-sans">
            Un proyecto de
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
