import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SessionRow {
  id: string;
  created_at: string;
}

interface LeadRow {
  id: string;
  score: 'CALIENTE' | 'TIBIO' | 'FRIO';
  score_numeric: number | null;
  created_at: string;
  resumen_enviado_at: string | null;
  broker_requested_at: string | null;
}

interface WidgetEventRow {
  event_type: string;
  created_at: string;
  session_id: string | null;
}

interface ChatHistoryRow {
  session_id: string;
}

interface FeedbackRow {
  id: string;
  created_at: string;
}

function presetToDate(preset: string | null): Date | null {
  if (!preset || preset === 'all') return null;
  const now = new Date();
  if (preset === 'today') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 0;
  if (!days) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const url = new URL(req.url);
  const preset = url.searchParams.get('range') || '30d';
  const since = presetToDate(preset);
  const sinceFilter = since ? `&created_at=gte.${since.toISOString()}` : '';

  // Helper para que un fallo en una tabla (ej. tabla no existe aún) no rompa todo el dashboard
  const safe = async <T>(p: Promise<{ rows: T[]; count: number | null }>) => {
    try {
      return await p;
    } catch {
      return { rows: [] as T[], count: 0 };
    }
  };

  try {
    const [sessions, leads, events, chatHistory, feedback] = await Promise.all([
      safe(
        supabaseSelect<SessionRow>(
          'sessions',
          {
            query: `select=id,created_at&order=created_at.desc&limit=5000${sinceFilter}`,
            exactCount: true,
          },
          config
        )
      ),
      safe(
        supabaseSelect<LeadRow>(
          'leads',
          {
            query: `select=id,score,score_numeric,created_at,resumen_enviado_at,broker_requested_at&order=created_at.desc&limit=5000${sinceFilter}`,
            exactCount: true,
          },
          config
        )
      ),
      safe(
        supabaseSelect<WidgetEventRow>(
          'widget_events',
          {
            query: `select=event_type,created_at,session_id&order=created_at.desc&limit=10000${sinceFilter}`,
            exactCount: true,
          },
          config
        )
      ),
      safe(
        supabaseSelect<ChatHistoryRow>(
          'mirador_chat_history',
          { query: 'select=session_id&limit=20000' },
          config
        )
      ),
      safe(
        supabaseSelect<FeedbackRow>(
          'chat_feedback',
          {
            query: `select=id,created_at&order=created_at.desc&limit=2000${sinceFilter}`,
            exactCount: true,
          },
          config
        )
      ),
    ]);

    const totalSessions = sessions.count ?? sessions.rows.length;
    const totalLeads = leads.count ?? leads.rows.length;
    const totalFeedback = feedback.count ?? feedback.rows.length;

    const launcherClicks = events.rows.filter(
      (e) => e.event_type === 'launcher_clicked'
    ).length;

    const conversationSessions = new Set(
      chatHistory.rows.map((r) => r.session_id)
    );
    const conversationsCount = conversationSessions.size;

    const scoreDist = leads.rows.reduce(
      (acc, l) => {
        acc[l.score] = (acc[l.score] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const brokerRequested = leads.rows.filter((l) => l.broker_requested_at).length;
    const resumenEnviado = leads.rows.filter((l) => l.resumen_enviado_at).length;

    // Daily series para los últimos N días según preset
    const days = preset === 'today' ? 1 : preset === '7d' ? 7 : preset === '30d' ? 30 : 60;
    const buckets: Record<string, { sessions: number; clicks: number; leads: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { sessions: 0, clicks: 0, leads: 0 };
    }
    sessions.rows.forEach((s) => {
      const k = s.created_at.slice(0, 10);
      if (buckets[k]) buckets[k].sessions += 1;
    });
    events.rows
      .filter((e) => e.event_type === 'launcher_clicked')
      .forEach((e) => {
        const k = e.created_at.slice(0, 10);
        if (buckets[k]) buckets[k].clicks += 1;
      });
    leads.rows.forEach((l) => {
      const k = l.created_at.slice(0, 10);
      if (buckets[k]) buckets[k].leads += 1;
    });

    const series = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));

    return NextResponse.json({
      range: preset,
      kpis: {
        sessions: totalSessions,
        launcher_clicks: launcherClicks,
        conversations_started: conversationsCount,
        leads: totalLeads,
        feedback: totalFeedback,
        broker_requested: brokerRequested,
        resumen_enviado: resumenEnviado,
      },
      score_distribution: {
        CALIENTE: scoreDist.CALIENTE || 0,
        TIBIO: scoreDist.TIBIO || 0,
        FRIO: scoreDist.FRIO || 0,
      },
      funnel: {
        sessions: totalSessions,
        clicks: launcherClicks,
        conversations: conversationsCount,
        leads: totalLeads,
        broker_requested: brokerRequested,
      },
      series,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
