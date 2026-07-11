import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAlert } from 'react-alert';
import { api } from '../../lib/api';
import { DISCORD_BOT_INVITE_URL } from '../../lib/config';
import { FaServer } from 'react-icons/fa';
import { DashboardHeaderSection } from './HeaderSection';
import { DashboardFiltersSection } from './FiltersSection';
import { DashboardEmptyState } from './EmptyState';
import { DashboardGuildGrid } from './GuildGrid';

async function fetchGuilds(): Promise<Guild[]> {
  const res = await api.get<Guild[]>('/guilds');
  return res.data;
}

export const Dashboard = () => {
  const params = useParams<{ guildId?: string }>();
  const alert = useAlert();
  const { data: guilds, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['guilds'],
    queryFn: fetchGuilds,
  });

  const hasShownGuildError = useRef(false);
  useEffect(() => {
    if (!isError || hasShownGuildError.current) return;
    hasShownGuildError.current = true;
    alert.error(
      'Failed to load servers. Try again, or log out and sign in with Discord to refresh your server list.',
    );
  }, [alert, isError]);

  const selectedGuild =
    guilds?.find((g) => String(g.id) === params.guildId) ?? null;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'uninstalled'>('all');

  const stats = useMemo(() => {
    const total = guilds?.length ?? 0;
    const botInstalled = guilds?.filter((g) => !!g.has_bot).length ?? 0;
    return { total, botInstalled };
  }, [guilds]);

  const filteredGuilds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = guilds ?? [];
    return list.filter((g) => {
      const matchesQuery = !q || g.name.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'installed'
            ? !!g.has_bot
            : !g.has_bot;
      return matchesQuery && matchesFilter;
    });
  }, [guilds, query, filter]);

  const handleAddBot = (guildId: string | number) => {
    const url = `${DISCORD_BOT_INVITE_URL}&guild_id=${String(
      guildId,
    )}&disable_guild_select=true`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="space-y-8"
    >
      <DashboardHeaderSection
        selectedGuild={selectedGuild}
        stats={stats}
        isLoading={isLoading}
        onAddBot={handleAddBot}
      />

      <DashboardFiltersSection
        query={query}
        filter={filter}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
        onReset={() => {
          setQuery('');
          setFilter('all');
        }}
      />

      {isLoading && (
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <FaServer className="text-slate-400" />
          Loading your servers…
        </p>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="flex items-center gap-2 font-medium">
            <FaServer className="text-red-400" />
            Failed to load servers.
          </p>
          <p className="mt-1 text-red-600">
            Try again below. If the problem continues, log out and sign in with Discord
            again to refresh your server list.
          </p>
          <button
            type="button"
            onClick={() => {
              hasShownGuildError.current = false;
              void refetch();
            }}
            disabled={isFetching}
            className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isFetching ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredGuilds.length === 0 && (
        <DashboardEmptyState />
      )}

      {!isLoading && !isError && filteredGuilds.length > 0 && (
        <DashboardGuildGrid
          guilds={filteredGuilds}
          activeGuildId={params.guildId}
          onAddBot={handleAddBot}
        />
      )}
    </motion.section>
  );
};
