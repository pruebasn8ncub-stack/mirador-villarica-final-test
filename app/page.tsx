import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { Descripcion } from '@/components/site/Descripcion';
import { MasterPlanInteractivo } from '@/components/site/MasterPlanInteractivo';
import { Galeria } from '@/components/site/Galeria';
import { Tour360 } from '@/components/site/Tour360';
import { Ubicacion } from '@/components/site/Ubicacion';
import { Cotizar } from '@/components/site/Cotizar';
import { Footer } from '@/components/site/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Descripcion />
        <MasterPlanInteractivo />
        <Galeria />
        <Tour360 />
        <Ubicacion />
        <Cotizar />
      </main>
      <Footer />
    </>
  );
}
