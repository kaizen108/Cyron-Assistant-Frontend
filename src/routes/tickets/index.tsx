import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { guildService } from '../../services/guildService';
import { PageLoader } from '../../components/ui/Skeleton';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
};
const PRIORITY_EMOJI: Record<string, string> = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };

export function TicketManagement() {
  const { guildId } = useParams<{ guildId: string }>();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', guildId, status, search, page],
    queryFn: () => guildService.fetchTickets(guildId!, { status, search, page, limit: 20 }),
    enabled: !!guildId,
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['ticket-detail', guildId, selected],
    queryFn: () => guildService.fetchTicketDetail(guildId!, selected!),
    enabled: !!guildId && !!selected,
  });

  if (isLoading) return <PageLoader label="Loading tickets…" />;

  const stats = data?.stats ?? {};
  const tickets = data?.tickets ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl">
      <h2 className="text-lg font-semibold text-slate-900">Ticket Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Queue', value: stats.open_queue ?? 0, sub: null },
          { label: 'Created (7d)', value: stats.created_7d ?? 0, sub: `Today: ${stats.today_created ?? 0}` },
          { label: 'Closed (7d)', value: stats.closed_7d ?? 0, sub: `Today: ${stats.today_closed ?? 0}` },
          { label: 'All-Time', value: stats.all_time ?? 0, sub: `Claimed: ${stats.claimed ?? 0}` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
            {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by channel name…"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-full sm:w-64" />
        {['all', 'open', 'closed'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-xl px-3 py-2 text-xs font-medium capitalize ${status === s ? 'bg-sky-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        {/* List */}
        <div className="flex-1 min-w-0 space-y-2">
          {tickets.length === 0 && <p className="text-sm text-slate-400">No tickets found.</p>}
          {tickets.map((t: any) => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-xs transition-colors ${selected === t.id ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-800">#{t.ticket_number ?? '—'} {t.channel_name ?? '—'}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[t.status] ?? 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
                    {t.priority && <span>{PRIORITY_EMOJI[t.priority]}</span>}
                  </div>
                  <p className="text-slate-400 mt-0.5">Panel: {t.panel_name} · {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</p>
                </div>
                {t.rating && <span className="text-yellow-500 flex-shrink-0">{'⭐'.repeat(t.rating)}</span>}
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 pt-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-slate-50">← Prev</button>
              <span className="text-xs text-slate-500">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-72 flex-shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col max-h-[70vh]">
            {detailLoading ? <div className="p-4 text-xs text-slate-400">Loading…</div> : detail ? (
              <>
                <div className="p-4 border-b border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-slate-900 truncate">#{detail.ticket?.ticket_number} {detail.ticket?.channel_name}</p>
                    <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 ml-2">✕</button>
                  </div>
                  {[
                    ['Panel', detail.ticket?.panel_name],
                    ['Status', detail.ticket?.status],
                    ['Priority', detail.ticket?.priority ? `${PRIORITY_EMOJI[detail.ticket.priority]} ${detail.ticket.priority}` : '—'],
                    ['Close Reason', detail.ticket?.close_reason || '—'],
                    ['Rating', detail.ticket?.rating ? '⭐'.repeat(detail.ticket.rating) : '—'],
                    ['Opened', detail.ticket?.created_at ? new Date(detail.ticket.created_at).toLocaleString() : '—'],
                    ['Closed', detail.ticket?.closed_at ? new Date(detail.ticket.closed_at).toLocaleString() : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs gap-2">
                      <span className="text-slate-500 flex-shrink-0">{k}</span>
                      <span className="text-slate-800 font-medium text-right truncate">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Chat</p>
                  {(detail.messages ?? []).map((m: any, i: number) => (
                    <div key={i} className={`rounded-xl px-3 py-2 text-xs ${m.role === 'assistant' ? 'bg-sky-50 text-sky-900 ml-4' : 'bg-slate-100 text-slate-800 mr-4'}`}>
                      <p className="font-medium text-[10px] mb-0.5 opacity-60">{m.role}</p>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  ))}
                  {detail.messages?.length === 0 && <p className="text-xs text-slate-400">No messages.</p>}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
