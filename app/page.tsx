import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { StatsHero } from '@/components/site/StatsHero';
import { VivirVillarrica } from '@/components/site/VivirVillarrica';
import { Pilares } from '@/components/site/Pilares';
import { SalesProgress } from '@/components/site/SalesProgress';
import { Galeria } from '@/components/site/Galeria';
import { Ubicacion } from '@/components/site/Ubicacion';
import { Financiamiento } from '@/components/site/Financiamiento';
import { Proceso } from '@/components/site/Proceso';
import { Tour360 } from '@/components/site/Tour360';
import { BrokerCard } from '@/components/site/BrokerCard';
import { Faq } from '@/components/site/Faq';
import { CtaFinal } from '@/components/site/CtaFinal';
import { Footer } from '@/components/site/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsHero />
        <VivirVillarrica />
        <Pilares />
        <SalesProgress />
        <Galeria />
        <Ubicacion />
        <Financiamiento />
        <Proceso />
        <Tour360 />
        <BrokerCard />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
