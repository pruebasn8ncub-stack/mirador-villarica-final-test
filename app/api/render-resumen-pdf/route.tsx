import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Link, Image } from '@react-pdf/renderer';
import React from 'react';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface Parcela {
  numero: string;
  destacada?: boolean;
  estado: string;
  tamano_m2: number | null;
  precio_contado: number | null;
  descuento_pct: number | null;
  precio_credito: number | null;
  pie_minimo_50pct: number | null;
  cuota_mensual_clp: number | null;
  cuota_mensual_uf: number | null;
}

interface RenderBody {
  primerNombre: string;
  uso?: string;
  forma_pago?: string;
  plazo_compra?: string;
  resumen_conversacion?: string;
  parcelas: Parcela[];
  base_url?: string;
}

const BRAND_GREEN = '#1a3d2e';
const BRAND_GREEN_DARK = '#122a20';
const BRAND_GOLD = '#f4a84b';
const BRAND_CREAM_LIGHT = '#f9f6f0';
const TEXT_DARK = '#333333';
const TEXT_MUTED = '#666666';
const DIVIDER = '#e8e4d9';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_DARK,
  },
  header: {
    backgroundColor: BRAND_GREEN,
    paddingVertical: 24,
    paddingHorizontal: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMirador: { width: 110, objectFit: 'contain' },
  logoTerra: { width: 130, objectFit: 'contain' },
  headerDivider: {
    color: '#ffffff',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginHorizontal: 14,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#ffffff33',
    borderRightColor: '#ffffff33',
  },
  body: { paddingHorizontal: 36, paddingTop: 24, paddingBottom: 12 },
  h1: { color: BRAND_GREEN, fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  greeting: { fontSize: 11, marginBottom: 8, lineHeight: 1.5 },
  intro: { fontSize: 11, marginBottom: 14, lineHeight: 1.5 },
  resumenBox: {
    backgroundColor: BRAND_CREAM_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_GOLD,
    padding: 12,
    marginBottom: 18,
    borderRadius: 2,
  },
  resumenLabel: {
    fontSize: 8,
    color: '#8a6a2e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  resumenText: { fontSize: 10.5, lineHeight: 1.5, color: '#444444' },
  h2: { color: BRAND_GREEN, fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 4, marginBottom: 8 },
  parcelaCard: {
    borderWidth: 1,
    borderColor: '#d7dcd5',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  parcelaHeader: {
    backgroundColor: BRAND_GREEN,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  parcelaHeaderText: { color: '#ffffff', fontSize: 13, fontFamily: 'Helvetica-Bold' },
  parcelaStar: { color: BRAND_GOLD, fontSize: 13, fontFamily: 'Helvetica-Bold', marginLeft: 6 },
  parcelaBody: { padding: 12 },
  row: { flexDirection: 'row', paddingVertical: 3 },
  rowLabel: { width: '45%', fontSize: 10, color: TEXT_MUTED },
  rowValue: { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold' },
  rowValueGreen: { flex: 1, fontSize: 11, fontFamily: 'Helvetica-Bold', color: BRAND_GREEN },
  rowValueGold: { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold', color: BRAND_GOLD },
  rowValueDiscount: { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#2d6a4f' },
  sectionDivider: { borderTopWidth: 1, borderTopColor: DIVIDER, marginTop: 6, paddingTop: 6 },
  sectionLabel: {
    fontSize: 8,
    color: '#8a6a2e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtle: { fontSize: 9, color: '#888888', fontFamily: 'Helvetica' },
  resourcesBox: {
    backgroundColor: BRAND_CREAM_LIGHT,
    borderRadius: 6,
    padding: 18,
    marginTop: 6,
    marginBottom: 6,
  },
  resourcesTitle: { color: BRAND_GREEN, fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 4 },
  resourcesSubtitle: { fontSize: 9, color: TEXT_MUTED, textAlign: 'center', marginBottom: 12 },
  resourceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  resourceLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BRAND_GREEN },
  resourceLink: { fontSize: 9, color: '#1a6bc7', textDecoration: 'underline', maxWidth: '60%', textAlign: 'right' },
  footer: {
    backgroundColor: BRAND_GREEN_DARK,
    paddingVertical: 14,
    paddingHorizontal: 36,
    marginTop: 18,
  },
  footerText: { color: '#8ea89b', fontSize: 8.5, textAlign: 'center', lineHeight: 1.6 },
});

const fmtClp = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `$${n.toLocaleString('es-CL')}`;
const fmtUf = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `${n.toFixed(2)} UF`;

function estadoLabel(estado: string): string {
  if (estado === 'disponible') return 'Disponible';
  if (estado === 'reservado') return 'Reservada';
  return 'Vendida';
}

function usoLabel(uso?: string): string {
  if (uso === 'inversion') return 'inversión';
  if (uso === 'segunda') return 'segunda vivienda';
  if (uso === 'vivienda') return 'vivienda permanente';
  return '';
}

function ParcelaCard({ p }: { p: Parcela }) {
  const hasContado = p.precio_contado !== null && p.precio_contado !== undefined;
  const hasCredito =
    (p.precio_credito !== null && p.precio_credito !== undefined) ||
    (p.pie_minimo_50pct !== null && p.pie_minimo_50pct !== undefined) ||
    (p.cuota_mensual_clp !== null && p.cuota_mensual_clp !== undefined);

  return (
    <View style={styles.parcelaCard} wrap={false}>
      <View style={styles.parcelaHeader}>
        <Text style={styles.parcelaHeaderText}>Parcela {p.numero}</Text>
        {p.destacada && <Text style={styles.parcelaStar}>★</Text>}
      </View>
      <View style={styles.parcelaBody}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tamaño</Text>
          <Text style={styles.rowValue}>
            {p.tamano_m2 ? p.tamano_m2.toLocaleString('es-CL') + ' m²' : '—'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Estado</Text>
          <Text style={styles.rowValue}>{estadoLabel(p.estado)}</Text>
        </View>
        {p.destacada && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Categoría</Text>
            <Text style={styles.rowValueGold}>Destacada</Text>
          </View>
        )}

        {hasContado && (
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionLabel}>Pago contado</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Precio contado</Text>
              <Text style={styles.rowValueGreen}>{fmtClp(p.precio_contado)}</Text>
            </View>
            {p.descuento_pct ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Descuento</Text>
                <Text style={styles.rowValueDiscount}>{p.descuento_pct}% OFF</Text>
              </View>
            ) : null}
          </View>
        )}

        {hasCredito && (
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionLabel}>Crédito directo</Text>
            {p.precio_credito !== null && p.precio_credito !== undefined && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Precio total</Text>
                <Text style={styles.rowValueGreen}>{fmtClp(p.precio_credito)}</Text>
              </View>
            )}
            {p.pie_minimo_50pct !== null && p.pie_minimo_50pct !== undefined && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Pie mínimo (50%)</Text>
                <Text style={styles.rowValue}>{fmtClp(p.pie_minimo_50pct)}</Text>
              </View>
            )}
            {p.cuota_mensual_uf !== null && p.cuota_mensual_uf !== undefined && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Cuota mensual</Text>
                <Text style={styles.rowValue}>
                  {fmtUf(p.cuota_mensual_uf)}{' '}
                  <Text style={styles.subtle}>(~{fmtClp(p.cuota_mensual_clp)} hoy)</Text>
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Plazo</Text>
              <Text style={styles.rowValue}>36 cuotas</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function ResumenDocument({ data }: { data: RenderBody }) {
  const base = data.base_url || 'https://mirador-villarrica-chatbot-pruebasn8ncub-6852s-projects.vercel.app';
  const LOGO_MIRADOR = `${base}/assets/mirador-logo.png`;
  const LOGO_TERRA = `${base}/assets/terra-segura-logo.png`;
  const TOUR_URL = 'https://lanube360.com/mirador-de-villarrica/';
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1gtqd1Xb6Yr3g3myw0nnJDsnZUSybQYS9aFAEJWaPqhQ/edit?gid=1975618999';
  const LOCATION_URL = 'https://www.google.com/maps/place/39%C2%B000%2752.4%22S+72%C2%B007%2740.8%22W/';
  const BROCHURE_URL = `${base}/brochure/mirador-villarrica-brochure.pdf`;

  const uso = usoLabel(data.uso);
  const pagoIntro =
    data.forma_pago === 'credito'
      ? ' con financiamiento vía crédito directo'
      : data.forma_pago === 'contado'
      ? ' con pago contado'
      : '';

  return (
    <Document
      title={`Resumen Mirador de Villarrica · ${data.primerNombre}`}
      author="Terra Segura Inmobiliaria"
      subject="Resumen personalizado Mirador de Villarrica"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={LOGO_MIRADOR} style={styles.logoMirador} />
          <Text style={styles.headerDivider}>Un proyecto de</Text>
          <Image src={LOGO_TERRA} style={styles.logoTerra} />
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.h1}>Tu recomendación personalizada</Text>
          <Text style={styles.greeting}>
            Hola <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.primerNombre}</Text>,
          </Text>
          <Text style={styles.intro}>
            Gracias por conversar con nosotros. En base a tu interés
            {uso ? (
              <>
                {' '}para <Text style={{ fontFamily: 'Helvetica-Bold' }}>{uso}</Text>
              </>
            ) : null}
            {pagoIntro}, preparamos este resumen con las parcelas que mejor se ajustan a tu perfil.
          </Text>

          {data.resumen_conversacion && data.resumen_conversacion.trim() && (
            <View style={styles.resumenBox}>
              <Text style={styles.resumenLabel}>Según lo que nos comentaste</Text>
              <Text style={styles.resumenText}>{data.resumen_conversacion.trim()}</Text>
            </View>
          )}

          <Text style={styles.h2}>Parcelas recomendadas</Text>
          {data.parcelas.length === 0 ? (
            <Text style={{ fontSize: 10, color: TEXT_MUTED }}>
              El equipo te enviará recomendaciones en detalle pronto.
            </Text>
          ) : (
            data.parcelas.map((p) => <ParcelaCard key={p.numero} p={p} />)
          )}

          {/* Recursos */}
          <View style={styles.resourcesBox}>
            <Text style={styles.resourcesTitle}>Recursos del proyecto</Text>
            <Text style={styles.resourcesSubtitle}>Explorá el proyecto a tu ritmo</Text>

            <View style={styles.resourceRow}>
              <Text style={styles.resourceLabel}>Tour 360°</Text>
              <Link src={TOUR_URL} style={styles.resourceLink}>
                lanube360.com/mirador-de-villarrica
              </Link>
            </View>
            <View style={styles.resourceRow}>
              <Text style={styles.resourceLabel}>Brochure PDF</Text>
              <Link src={BROCHURE_URL} style={styles.resourceLink}>
                Descargar PDF
              </Link>
            </View>
            <View style={styles.resourceRow}>
              <Text style={styles.resourceLabel}>Inventario en vivo</Text>
              <Link src={SHEET_URL} style={styles.resourceLink}>
                Ver planilla
              </Link>
            </View>
            <View style={styles.resourceRow}>
              <Text style={styles.resourceLabel}>Ubicación</Text>
              <Link src={LOCATION_URL} style={styles.resourceLink}>
                Ver en mapa
              </Link>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Equipo de Ventas — Terra Segura Inmobiliaria{'\n'}
            Mirador de Villarrica · Región de La Araucanía
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  const token = (process.env.N8N_WEBHOOK_TOKEN || '').trim();
  const auth = (req.headers.get('x-render-token') || '').trim();
  if (token && auth !== token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: RenderBody;
  try {
    body = (await req.json()) as RenderBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body?.primerNombre || !Array.isArray(body?.parcelas)) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const pdfBuffer = await renderToBuffer(<ResumenDocument data={body} />);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="resumen-mirador-${body.primerNombre.toLowerCase()}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
