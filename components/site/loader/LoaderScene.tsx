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
