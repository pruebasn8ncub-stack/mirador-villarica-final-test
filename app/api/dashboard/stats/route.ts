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
  created_at: string;
  parcela_interes: string | null;
  plazo: string | null;
  forma_pago: string | null;
  uso: string | null;
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
            query: `select=id,created_at,parcela_interes,plazo,forma_pago,uso&order=created_at.desc&limit=5000${sinceFilter}`,
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

    const qualified = leads.rows.filter(
      (l) => l.parcela_interes || l.plazo || l.forma_pago || l.uso
    ).length;

    // Distribución por forma de pago / uso para reemplazar el viejo score chart
    const formaPagoDist: Record<string, number> = {};
    const usoDist: Record<string, number> = {};
    for (const l of leads.rows) {
      if (l.forma_pago) formaPagoDist[l.forma_pago] = (formaPagoDist[l.forma_pago] || 0) + 1;
      if (l.uso) usoDist[l.uso] = (usoDist[l.uso] || 0) + 1;
    }

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
        qualified_leads: qualified,
        feedback: totalFeedback,
      },
      forma_pago_distribution: formaPagoDist,
      uso_distribution: usoDist,
      funnel: {
        sessions: totalSessions,
        clicks: launcherClicks,
        conversations: conversationsCount,
        leads: totalLeads,
        qualified: qualified,
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
