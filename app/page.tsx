import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { Descripcion } from '@/components/site/Descripcion';
import { Galeria } from '@/components/site/Galeria';
import { Tour360 } from '@/components/site/Tour360';
import { LugaresCercanos } from '@/components/site/LugaresCercanos';
import { MasterPlan } from '@/components/site/MasterPlan';
import { Cotizar } from '@/components/site/Cotizar';
import { Footer } from '@/components/site/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Descripcion />
        <Galeria />
        <Tour360 />
        <LugaresCercanos />
        <MasterPlan />
        <Cotizar />
      </main>
      <Footer />
    </>
  );
}
