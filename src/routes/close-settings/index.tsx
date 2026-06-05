import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildService } from '../../services/guildService';
import { PageLoader } from '../../components/ui/Skeleton';

const Toggle = ({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-2.5">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-sky-600' : 'bg-slate-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export function CloseSettings() {
  const { guildId } = useParams<{ guildId: string }>();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['close-settings', guildId],
    queryFn: () => guildService.fetchCloseSettings(guildId!),
    enabled: !!guildId,
  });

  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const saveMut = useMutation({
    mutationFn: () => guildService.updateCloseSettings(guildId!, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['close-settings', guildId] });
      setToast('Saved.');
      setTimeout(() => setToast(null), 2500);
    },
  });

  if (isLoading) return <PageLoader label="Loading close settings…" />;

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Close Settings</h2>
        <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60">
          {saveMut.isPending ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Saving…</> : 'Save'}
        </button>
      </div>

      {/* Close Embed */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Close Message</p>
        <p className="text-xs text-slate-400">Sent in the ticket channel before it's deleted. Supports: {'{ticket.closer.mention}'}, {'{ticket.closeReason}'}</p>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Title</span>
          <input value={form.close_embed_title ?? ''} onChange={e => set('close_embed_title', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Ticket Closed" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Description</span>
          <textarea value={form.close_embed_description ?? ''} onChange={e => set('close_embed_description', e.target.value)} rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Your ticket has been closed by {ticket.closer.mention}." />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Footer</span>
          <input value={form.close_embed_footer ?? ''} onChange={e => set('close_embed_footer', e.target.value || null)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Default Close Reason</span>
          <input value={form.default_close_reason ?? ''} onChange={e => set('default_close_reason', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="No further action required." />
        </label>
      </div>

      {/* Toggles */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 divide-y divide-slate-100">
        <Toggle label="DM user on close" hint="Send the close embed to the ticket creator via DM"
          checked={!!form.dm_user_on_close} onChange={v => set('dm_user_on_close', v)} />
        <Toggle label="Show transcript button" hint="Add a View Transcript button to the close message"
          checked={!!form.show_transcript_button} onChange={v => set('show_transcript_button', v)} />
        <Toggle label="Require reason to close" hint="Staff must type a reason when closing a ticket"
          checked={!!form.require_reason_to_close} onChange={v => set('require_reason_to_close', v)} />
        <Toggle label="Confirm before close" hint="Show a YES confirmation modal before closing"
          checked={!!form.confirm_close_check} onChange={v => set('confirm_close_check', v)} />
        <Toggle label="Close on user leave" hint="Auto-close open tickets when the creator leaves the server"
          checked={!!form.close_on_user_leave} onChange={v => set('close_on_user_leave', v)} />
      </div>

      {/* Rating */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 divide-y divide-slate-100">
        <Toggle label="Rating system" hint="Ask ticket creator to rate support after closing (1–5 stars)"
          checked={!!form.rating_system_enabled} onChange={v => set('rating_system_enabled', v)} />
        {form.rating_system_enabled && (
          <div className="py-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Rating Log Channel ID</span>
              <input value={form.rating_log_channel_id ?? ''} onChange={e => set('rating_log_channel_id', e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Discord channel ID" />
            </label>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}
