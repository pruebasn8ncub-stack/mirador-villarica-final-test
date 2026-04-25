// Open Graph dinámica vía next/og (incluida en Next.js 14, sin dep extra).
import { ImageResponse } from 'next/og';
import { PROYECTO } from '@/data/content';

export const runtime = 'edge';
export const alt = `${PROYECTO.nombre} — ${PROYECTO.totalParcelas} parcelas en ${PROYECTO.ubicacion}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background:
            'linear-gradient(135deg, #1a3d2e 0%, #264d3a 60%, #33664d 100%)',
          color: '#faf6ee',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: '#f4a84b',
              color: '#1a3d2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {PROYECTO.nombre}
            </span>
            <span style={{ fontSize: 16, opacity: 0.7, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Terra Segura
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <p style={{ fontSize: 64, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
            Tu pedazo de sur,{'\n'}
            <span style={{ color: '#f4a84b', fontStyle: 'italic' }}>
              donde el tiempo se detiene.
            </span>
          </p>
          <p style={{ fontSize: 26, opacity: 0.85, margin: 0, maxWidth: 880 }}>
            {PROYECTO.totalParcelas} parcelas en {PROYECTO.superficieTotal} entre el volcán y el lago Colico.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              background: '#f4a84b',
              color: '#1a3d2e',
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Desde {PROYECTO.precioContado}
          </div>
          <div
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              border: '1.5px solid rgba(250, 246, 238, 0.35)',
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            SAG aprobado · Crédito directo
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
