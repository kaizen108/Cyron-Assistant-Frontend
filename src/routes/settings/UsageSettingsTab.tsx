import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader } from "../../components/ui/Loader";
import { useApp } from "../../context/AppContext";

export const UsageTab = ({
    usage, usageLoading, usageError,
    historyLoading, historyError,
    logsLoading, logsError,
    chartData, recentActivity,
}: {
    usage: any; usageLoading: boolean; usageError: boolean;
    historyLoading: boolean; historyError: boolean;
    logsLoading: boolean; logsError: boolean;
    chartData: any[]; recentActivity: any[];
}) => {
    const { theme } = useApp();
    const isDark = theme === 'dark';

    return (
        <motion.div key="usage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">

            {(usageLoading || historyLoading || logsLoading) && (
                <div className="rounded-xl bg-white p-4 shadow-soft">
                    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><Loader /> Loading usage…</div>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}
                    </div>
                </div>
            )}

            {(usageError || historyError || logsError) && (
                <p className="text-sm text-red-500">Failed to load usage analytics. Please refresh.</p>
            )}

            {usage && !usageLoading && !usageError && (
                <>
                    {/* Stats grid — 1 col mobile, 3 col sm+ */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                        {[
                            { label: 'Monthly tokens', used: usage.monthly_tokens_used, limit: usage.monthly_tokens_limit },
                            { label: 'Tickets today', used: usage.daily_ticket_count, limit: usage.daily_ticket_limit },
                            { label: 'Concurrent sessions', used: usage.concurrent_ai_sessions, limit: usage.concurrent_limit },
                        ].map(({ label, used, limit }, i) => (
                            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="rounded-xl bg-white p-4 shadow-soft">
                                <p className="text-xs font-medium text-slate-500">{label}</p>
                                <p className="mt-1 text-xl font-semibold text-primary">
                                    {used.toLocaleString()} <span className="text-sm text-slate-400">/ {limit.toLocaleString()}</span>
                                </p>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                                        transition={{ duration: 0.4 }} className="h-full rounded-full bg-primary" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="rounded-xl bg-white p-4 shadow-soft">
                        <p className="mb-1 text-sm font-semibold text-slate-700">Token usage (last 7 days)</p>
                        <p className="mb-3 text-xs text-slate-500">Daily token usage from live logs.</p>
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#1ab7ef" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#1ab7ef" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, backgroundColor: isDark ? '#0f172a' : '#fff' }}
                                        formatter={(v) => [(typeof v === 'number' ? v : Number(v ?? 0)).toLocaleString(), 'Tokens']} />
                                    <Area type="monotone" dataKey="tokens" stroke="#1ab7ef" strokeWidth={2} fill="url(#tg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent activity — card list on mobile, table on sm+ */}
                    <div className="rounded-xl bg-white p-4 shadow-soft">
                        <p className="mb-3 text-sm font-semibold text-slate-700">Recent activity</p>

                        {/* Mobile cards */}
                        <div className="space-y-2 sm:hidden">
                            {recentActivity.map((row) => (
                                <div key={row.id} className="rounded-lg border border-slate-100 p-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-primary">{row.tokens} tokens</span>
                                        <span className="text-slate-400">{new Date(row.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="mt-1 text-slate-500">{row.preview}</p>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="pb-2 pr-4 font-medium">Time</th>
                                        <th className="pb-2 pr-4 font-medium">Tokens</th>
                                        <th className="pb-2 font-medium">Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map((row) => (
                                        <tr key={row.id} className="border-b border-slate-100">
                                            <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                                            <td className="py-2 pr-4 font-mono text-primary">{row.tokens}</td>
                                            <td className="py-2 max-w-[200px] truncate">{row.preview}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
