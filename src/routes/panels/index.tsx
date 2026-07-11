import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildService } from '../../services/guildService';
import { PageLoader } from '../../components/ui/Skeleton';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DEFAULT_SCHEDULE = Object.fromEntries(
  DAYS.map((d) => [d, { enabled: !['saturday','sunday'].includes(d), open: '09:00', close: '18:00' }])
);

const EMPTY: Omit<Panel, 'id' | 'guild_id'> = {
  name: '', bot_id: null, ticket_category_name: 'Tickets',
  button_text: 'Open Ticket', button_emoji: null, welcome_message: null, ai_context_id: null,
  is_enabled: true, ai_auto_reply: false, support_role_ids: null, overflow_category_ids: null,
  threading_mode: false, save_transcripts: true,
  channel_name_format: '{panel.name}-{ticket.number}',
  roles_required: null, roles_blocked: null, limit_bypass_roles: null,
  max_open_tickets_per_user: 1, creation_cooldown_seconds: 0,
  users_can_close: false, claiming_enabled: true, claiming_visibility: 'view_only',
  footer_text: null,
  panel_embed_author: null, panel_embed_title: 'Create a ticket',
  panel_embed_description: 'Click the button below to open a support ticket.',
  panel_embed_footer: null, panel_embed_color: '#5865F2',
  button_type: 'button', button_color: 'blurple',
  welcome_ping_ticket_creator: true, welcome_ping_support_roles: true, welcome_ping_admin_role: false,
  welcome_embed_author: null, welcome_embed_title: 'Ticket Created',
  welcome_embed_description: 'Welcome {ticket.creator.mention}! Please describe your issue.',
  welcome_embed_footer: null, auto_pin_welcome: true,
  close_button_emoji: '🔒', close_button_label: 'Close', close_button_color: 'red',
  claim_button_emoji: '👤', claim_button_label: 'Claim', unclaim_button_label: 'Unclaim', claim_button_color: 'blurple',
  forms_enabled: false, form_questions: null,
  support_hours_enabled: false, support_hours_timezone: 'UTC',
  support_hours_schedule: DEFAULT_SCHEDULE, closed_state_logic: 'allow_with_warning', msg_closed: null,
  log_channel_id: null, send_logs_in_ticket: false,
  sync_category_permissions: false, autoclose_hours: null, autoclose_warning_hours: null,
  published_channel_id: null, published_message_id: null,
};

type Tab = 'general' | 'ai' | 'embed' | 'messages' | 'forms' | 'availability' | 'logging';
const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'ai', label: 'AI' },
  { id: 'embed', label: 'Embed' },
  { id: 'messages', label: 'Messages' },
  { id: 'forms', label: 'Forms' },
  { id: 'availability', label: 'Availability' },
  { id: 'logging', label: 'Logging' },
];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const Input = ({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
);

const Toggle = ({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) => (
  <div className="flex items-center justify-between py-2">
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

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export function Panels() {
  const { guildId } = useParams<{ guildId: string }>();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Panel | null>(null);
  const [form, setForm] = useState<Omit<Panel, 'id' | 'guild_id'>>(EMPTY);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('general');
  const [sendingPanel, setSendingPanel] = useState<Panel | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [createContextOpen, setCreateContextOpen] = useState(false);
  const [newContextName, setNewContextName] = useState('');

  const set = (key: keyof typeof EMPTY, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const { data: panels = [], isLoading } = useQuery({
    queryKey: ['panels', guildId],
    queryFn: () => guildService.fetchPanels(guildId!),
    enabled: !!guildId,
  });

  const { data: contexts = [], isLoading: contextsLoading } = useQuery({
    queryKey: ['contexts', guildId],
    queryFn: () => guildService.fetchContexts(guildId!),
    enabled: !!guildId,
  });

  const { data: generalRules } = useQuery({
    queryKey: ['general-rules', guildId],
    queryFn: () => guildService.fetchGeneralRules(guildId!),
    enabled: !!guildId,
  });

  const panelContexts = contexts.filter((c) => c.id !== generalRules?.id);

  const { data: channels = [] } = useQuery({
    queryKey: ['channels', guildId],
    queryFn: () => guildService.fetchChannels(guildId!),
    enabled: !!guildId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['panels', guildId] });
  const createMut = useMutation({ mutationFn: (p: typeof EMPTY) => guildService.createPanel(guildId!, p), onSuccess: invalidate });
  const updateMut = useMutation({ mutationFn: (p: Panel) => guildService.updatePanel(guildId!, p.id, p), onSuccess: invalidate });
  const deleteMut = useMutation({ mutationFn: (id: string) => guildService.deletePanel(guildId!, id), onSuccess: invalidate });
  const createContextMut = useMutation({
    mutationFn: (name: string) => guildService.createContext(guildId!, { name }),
    onSuccess: (ctx) => {
      qc.invalidateQueries({ queryKey: ['contexts', guildId] });
      set('ai_context_id', ctx.id);
      setCreateContextOpen(false);
      setNewContextName('');
    },
  });

  function openCreate() { setEditing(null); setForm(EMPTY); setTab('general'); setOpen(true); }
  function openEdit(p: Panel) { setEditing(p); setForm(p as any); setTab('general'); setOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) await updateMut.mutateAsync({ ...form, id: editing.id, guild_id: editing.guild_id } as Panel);
    else await createMut.mutateAsync(form);
    setOpen(false);
  }

  if (isLoading || contextsLoading) return <PageLoader label="Loading panels…" />;

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900">Ticket Panels</h2>
        <button onClick={openCreate} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">+ New Panel</button>
      </div>

      {panels.length === 0 && <p className="text-slate-500 text-sm">No panels yet. Create one to get started.</p>}

      <div className="space-y-3">
        {panels.map((p) => {
          const ctx = panelContexts.find((c) => c.id === p.ai_context_id);
          return (
            <div key={p.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  {!p.is_enabled && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Disabled</span>}
                </div>
                <p className="text-xs text-slate-500">
                  Category: {p.ticket_category_name} · Button: {p.button_text} · Context: {ctx?.name ?? '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSendingPanel(p); setSelectedChannel(''); }} className="rounded-lg border border-indigo-200 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50">Send Panel</button>
                <button onClick={() => openEdit(p)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50">Edit</button>
                <button onClick={() => deleteMut.mutate(p.id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form onSubmit={handleSubmit} className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white shadow-xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold">{editing ? 'Edit Panel' : 'New Panel'}</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 overflow-x-auto border-b border-slate-100 px-4 pt-2">
              {TABS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap px-3 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {tab === 'general' && <>
                <Field label="Panel Name *">
                  <Input value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Sales Support" />
                </Field>
                <Field label="Ticket Category">
                  <Input value={form.ticket_category_name} onChange={(v) => set('ticket_category_name', v)} placeholder="Tickets" />
                </Field>
                <Field label="Channel Name Format">
                  <Input value={form.channel_name_format} onChange={(v) => set('channel_name_format', v)} />
                  <p className="mt-1 text-[11px] text-slate-400">Variables: {'{panel.name}'}, {'{ticket.creator.username}'}, {'{ticket.number}'}</p>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Max tickets per user">
                    <Input type="number" value={String(form.max_open_tickets_per_user)} onChange={(v) => set('max_open_tickets_per_user', parseInt(v) || 1)} />
                  </Field>
                  <Field label="Cooldown (seconds)">
                    <Input type="number" value={String(form.creation_cooldown_seconds)} onChange={(v) => set('creation_cooldown_seconds', parseInt(v) || 0)} />
                  </Field>
                </div>
                <Field label="Claiming Visibility">
                  <Select value={form.claiming_visibility} onChange={(v) => set('claiming_visibility', v)}
                    options={[
                      { value: 'view_only', label: 'View Only — support can view but not write' },
                      { value: 'full_access', label: 'Full Access — no permission changes' },
                      { value: 'only_claimer', label: 'Only Claimer — removes all other support access' },
                    ]} />
                </Field>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3">
                  <Toggle label="Panel Enabled" checked={form.is_enabled} onChange={(v) => set('is_enabled', v)} />
                  <Toggle label="Claiming Enabled" checked={form.claiming_enabled} onChange={(v) => set('claiming_enabled', v)} />
                  <Toggle label="Users Can Close" checked={form.users_can_close} onChange={(v) => set('users_can_close', v)} hint="Allow ticket creator to close their own ticket" />
                  <Toggle label="Save Transcripts" checked={form.save_transcripts} onChange={(v) => set('save_transcripts', v)} />
                </div>
              </>}

              {tab === 'ai' && <>
                <p className="text-xs text-slate-500 mb-2">Configure AI auto-reply behavior for tickets opened from this panel.</p>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3">
                  <Toggle label="AI Auto-Reply" checked={form.ai_auto_reply} onChange={(v) => set('ai_auto_reply', v)} hint="When enabled, the AI will automatically respond to user messages in tickets" />
                </div>
                {form.ai_auto_reply ? (
                  <div className="space-y-3 mt-3">
                    <Field label="AI Context">
                      <div className="flex gap-2">
                        <select
                          value={form.ai_context_id || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '__create__') {
                              setCreateContextOpen(true);
                              return;
                            }
                            set('ai_context_id', value || null);
                          }}
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option value="">— Select AI Context —</option>
                          {panelContexts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                          <option value="__create__">+ Create new context</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setCreateContextOpen(true)}
                          className="shrink-0 rounded-xl border border-dashed border-sky-300 px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-50"
                        >
                          + Create new context
                        </button>
                      </div>
                    </Field>
                    <p className="text-xs text-slate-400">
                      The AI Context provides instructions and knowledge the bot uses to answer questions.
                      {!form.ai_context_id && " If none is selected, General Rules alone will be used (when enabled)."}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    AI is disabled for this panel — tickets work as normal, staff only.
                  </p>
                )}
              </>}

              {tab === 'embed' && <>
                <p className="text-xs text-slate-500">This is the embed sent in the channel when you run /sendpanel.</p>
                <Field label="Embed Title">
                  <Input value={form.panel_embed_title ?? ''} onChange={(v) => set('panel_embed_title', v)} placeholder="Create a ticket" />
                </Field>
                <Field label="Embed Description">
                  <Textarea value={form.panel_embed_description ?? ''} onChange={(v) => set('panel_embed_description', v)} placeholder="Click the button below to open a support ticket." />
                </Field>
                <Field label="Embed Author">
                  <Input value={form.panel_embed_author ?? ''} onChange={(v) => set('panel_embed_author', v || null)} />
                </Field>
                <Field label="Embed Footer">
                  <Input value={form.panel_embed_footer ?? ''} onChange={(v) => set('panel_embed_footer', v || null)} />
                </Field>
                <Field label="Embed Color">
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.panel_embed_color ?? '#5865F2'} onChange={(e) => set('panel_embed_color', e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200" />
                    <Input value={form.panel_embed_color ?? '#5865F2'} onChange={(v) => set('panel_embed_color', v)} placeholder="#5865F2" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Button Text">
                    <Input value={form.button_text} onChange={(v) => set('button_text', v)} placeholder="Open Ticket" />
                  </Field>
                  <Field label="Button Emoji">
                    <Input value={form.button_emoji ?? ''} onChange={(v) => set('button_emoji', v || null)} placeholder="🎫" />
                  </Field>
                </div>
                <Field label="Button Color">
                  <Select value={form.button_color} onChange={(v) => set('button_color', v)}
                    options={[
                      { value: 'blurple', label: 'Blurple (Discord Blue)' },
                      { value: 'green', label: 'Green' },
                      { value: 'red', label: 'Red' },
                      { value: 'grey', label: 'Grey' },
                    ]} />
                </Field>
              </>}

              {tab === 'messages' && <>
                <p className="text-xs text-slate-500">The welcome message sent inside the ticket channel when it opens. Supports: {'{ticket.creator.mention}'}, {'{ticket.number}'}, {'{panel.name}'}</p>
                <Field label="Welcome Title">
                  <Input value={form.welcome_embed_title ?? ''} onChange={(v) => set('welcome_embed_title', v)} placeholder="Ticket Created" />
                </Field>
                <Field label="Welcome Description">
                  <Textarea value={form.welcome_embed_description ?? ''} onChange={(v) => set('welcome_embed_description', v)} rows={4} />
                </Field>
                <Field label="Welcome Footer">
                  <Input value={form.welcome_embed_footer ?? ''} onChange={(v) => set('welcome_embed_footer', v || null)} />
                </Field>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3">
                  <Toggle label="Ping ticket creator" checked={form.welcome_ping_ticket_creator} onChange={(v) => set('welcome_ping_ticket_creator', v)} />
                  <Toggle label="Ping support roles" checked={form.welcome_ping_support_roles} onChange={(v) => set('welcome_ping_support_roles', v)} />
                  <Toggle label="Pin welcome message" checked={form.auto_pin_welcome} onChange={(v) => set('auto_pin_welcome', v)} />
                </div>
                <p className="text-xs font-medium text-slate-600 pt-2">Close Button</p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Label"><Input value={form.close_button_label ?? 'Close'} onChange={(v) => set('close_button_label', v)} /></Field>
                  <Field label="Emoji"><Input value={form.close_button_emoji ?? '🔒'} onChange={(v) => set('close_button_emoji', v)} /></Field>
                  <Field label="Color">
                    <Select value={form.close_button_color} onChange={(v) => set('close_button_color', v)}
                      options={[{ value: 'red', label: 'Red' }, { value: 'blurple', label: 'Blurple' }, { value: 'green', label: 'Green' }, { value: 'grey', label: 'Grey' }]} />
                  </Field>
                </div>
                <p className="text-xs font-medium text-slate-600 pt-2">Claim Button</p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Label"><Input value={form.claim_button_label ?? 'Claim'} onChange={(v) => set('claim_button_label', v)} /></Field>
                  <Field label="Emoji"><Input value={form.claim_button_emoji ?? '👤'} onChange={(v) => set('claim_button_emoji', v)} /></Field>
                  <Field label="Color">
                    <Select value={form.claim_button_color} onChange={(v) => set('claim_button_color', v)}
                      options={[{ value: 'blurple', label: 'Blurple' }, { value: 'green', label: 'Green' }, { value: 'red', label: 'Red' }, { value: 'grey', label: 'Grey' }]} />
                  </Field>
                </div>
              </>}

              {tab === 'forms' && <>
                <Toggle label="Enable pre-open form" checked={form.forms_enabled} onChange={(v) => set('forms_enabled', v)}
                  hint="Show a modal with questions before the ticket channel is created" />
                {form.forms_enabled && (
                  <FormQuestionsEditor
                    questions={form.form_questions ?? []}
                    onChange={(q) => set('form_questions', q)} />
                )}
              </>}

              {tab === 'availability' && <>
                <Toggle label="Enable support hours" checked={form.support_hours_enabled} onChange={(v) => set('support_hours_enabled', v)} />
                {form.support_hours_enabled && <>
                  <Field label="Timezone">
                    <Input value={form.support_hours_timezone} onChange={(v) => set('support_hours_timezone', v)} placeholder="UTC" />
                    <p className="mt-1 text-[11px] text-slate-400">e.g. Europe/Rome, America/New_York, UTC</p>
                  </Field>
                  <Field label="When closed">
                    <Select value={form.closed_state_logic} onChange={(v) => set('closed_state_logic', v)}
                      options={[
                        { value: 'allow_with_warning', label: 'Allow with warning' },
                        { value: 'deny_creation', label: 'Deny ticket creation' },
                      ]} />
                  </Field>
                  <p className="text-xs font-medium text-slate-600">Weekly Schedule</p>
                  <div className="space-y-2">
                    {DAYS.map((day) => {
                      const s = (form.support_hours_schedule ?? DEFAULT_SCHEDULE)[day] ?? { enabled: false, open: '09:00', close: '18:00' };
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <input type="checkbox" checked={s.enabled}
                            onChange={(e) => set('support_hours_schedule', { ...(form.support_hours_schedule ?? DEFAULT_SCHEDULE), [day]: { ...s, enabled: e.target.checked } })}
                            className="h-4 w-4 rounded" />
                          <span className="w-24 text-xs capitalize text-slate-700">{day}</span>
                          <input type="time" value={s.open ?? '09:00'} disabled={!s.enabled}
                            onChange={(e) => set('support_hours_schedule', { ...(form.support_hours_schedule ?? DEFAULT_SCHEDULE), [day]: { ...s, open: e.target.value } })}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-40" />
                          <span className="text-xs text-slate-400">to</span>
                          <input type="time" value={s.close ?? '18:00'} disabled={!s.enabled}
                            onChange={(e) => set('support_hours_schedule', { ...(form.support_hours_schedule ?? DEFAULT_SCHEDULE), [day]: { ...s, close: e.target.value } })}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-40" />
                        </div>
                      );
                    })}
                  </div>
                </>}
                <div className="pt-2 space-y-3">
                  <p className="text-xs font-medium text-slate-600">Autoclose</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Close after inactivity (hours)">
                      <Input type="number" value={String(form.autoclose_hours ?? '')} onChange={(v) => set('autoclose_hours', v ? parseInt(v) : null)} placeholder="e.g. 48" />
                    </Field>
                    <Field label="Warn before close (hours)">
                      <Input type="number" value={String(form.autoclose_warning_hours ?? '')} onChange={(v) => set('autoclose_warning_hours', v ? parseInt(v) : null)} placeholder="e.g. 24" />
                    </Field>
                  </div>
                </div>
              </>}

              {tab === 'logging' && <>
                <Field label="Log Channel ID">
                  <Input value={String(form.log_channel_id ?? '')} onChange={(v) => set('log_channel_id', v ? parseInt(v) : null)} placeholder="Discord channel ID" />
                  <p className="mt-1 text-[11px] text-slate-400">Ticket events will be logged to this channel.</p>
                </Field>
                <Toggle label="Send logs inside ticket channel" checked={form.send_logs_in_ticket} onChange={(v) => set('send_logs_in_ticket', v)}
                  hint="Also post event logs inside the ticket channel itself" />
                <Toggle label="Sync category permissions" checked={form.sync_category_permissions} onChange={(v) => set('sync_category_permissions', v)}
                  hint="When moving a ticket, sync permissions from the new category" />
              </>}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60">
                {(createMut.isPending || updateMut.isPending)
                  ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Saving…</>
                  : 'Save Panel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create AI Context modal */}
      {createContextOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">New AI Context</h3>
              <button type="button" onClick={() => { setCreateContextOpen(false); setNewContextName(''); }}
                className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <p className="text-xs text-slate-500">Create a panel-specific context. It will be linked to this panel automatically.</p>
            <input
              autoFocus
              value={newContextName}
              onChange={(e) => setNewContextName(e.target.value)}
              placeholder="e.g. Sales Support"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newContextName.trim()) {
                  e.preventDefault();
                  createContextMut.mutate(newContextName.trim());
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setCreateContextOpen(false); setNewContextName(''); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button
                type="button"
                disabled={!newContextName.trim() || createContextMut.isPending}
                onClick={() => createContextMut.mutate(newContextName.trim())}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {createContextMut.isPending ? 'Creating…' : 'Create & Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Panel Modal */}
      {sendingPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold">Send Panel to Channel</h3>
            <p className="text-xs text-slate-500">Select a channel to send the <span className="font-medium text-slate-700 dark:text-slate-300">{sendingPanel.name || 'Unnamed'}</span> panel embed.</p>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">Select a channel…</option>
              {(channels as {id: string; name: string}[]).map((ch) => (
                <option key={ch.id} value={ch.id}>#{ch.name}</option>
              ))}
            </select>
            {channels.length === 0 && (
              <p className="text-xs text-amber-500">No channels found. Make sure the bot is online and restart it to sync channels.</p>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSendingPanel(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button
                disabled={!selectedChannel}
                onClick={async () => {
                  if (!selectedChannel || !guildId) return;
                  try {
                    await guildService.sendPanelToChannel(guildId, sendingPanel.id, selectedChannel);
                    setSendingPanel(null);
                    alert('✅ Panel sent! Check the channel in Discord.');
                  } catch {
                    alert('❌ Failed to send panel. Make sure the bot is online.');
                  }
                }}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                Send the Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormQuestionsEditor({ questions, onChange }: { questions: FormQuestion[]; onChange: (q: FormQuestion[]) => void }) {
  const add = () => onChange([...questions, {
    id: `q${Date.now()}`, label: '', answer_type: 'text', required: true,
    placeholder: '', min_length: 0, max_length: 500, order: questions.length,
  }]);
  const remove = (i: number) => onChange(questions.filter((_, idx) => idx !== i));
  const update = (i: number, key: keyof FormQuestion, value: any) =>
    onChange(questions.map((q, idx) => idx === i ? { ...q, [key]: value } : q));

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Question {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          <input value={q.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Question label"
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          <div className="grid grid-cols-2 gap-2">
            <select value={q.answer_type} onChange={(e) => update(i, 'answer_type', e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
              <option value="text">Short text</option>
              <option value="multiline">Long text</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={q.required} onChange={(e) => update(i, 'required', e.target.checked)} className="h-4 w-4" />
              <span className="text-xs text-slate-600">Required</span>
            </div>
          </div>
          <input value={q.placeholder ?? ''} onChange={(e) => update(i, 'placeholder', e.target.value)} placeholder="Placeholder text"
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      ))}
      {questions.length < 5 && (
        <button type="button" onClick={add}
          className="w-full rounded-xl border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:bg-slate-50">
          + Add Question ({questions.length}/5)
        </button>
      )}
    </div>
  );
}
