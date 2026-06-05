import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TopNav } from './TopNav';
import { GuildSidebarNav } from './GuildSidebarNav';
import { Footer } from './Footer';
import { api } from '../../lib/api';
import { AnimatedOutlet } from '../motion/AnimatedOutlet';

async function fetchGuilds(): Promise<Guild[]> {
  const res = await api.get<Guild[]>('/guilds');
  return res.data;
}

export const AppLayout = () => {
  const params = useParams<{ guildId?: string }>();
  const { data: guilds } = useQuery({
    queryKey: ['guilds'],
    queryFn: fetchGuilds,
  });

  const selectedGuild =
    guilds?.find((g) => String(g.id) === params.guildId) ?? null;

  return (
    <>
      <TopNav currentGuildName={selectedGuild?.name} />
      <div className="min-h-screen bg-bg-base">
        {params.guildId ? (
          <div className="mx-auto flex items-start max-w-6xl gap-4 px-3 pb-16 pt-3 md:pb-8 md:pt-5 md:px-5 lg:px-6 mt-8 md:mt-0">
            <GuildSidebarNav guild={selectedGuild} />
            <main className="flex-1 min-w-0">
              <AnimatedOutlet />
            </main>
          </div>
        ) : (
          <main className="flex-1 px-4 pb-14 pt-8 sm:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <AnimatedOutlet />
            </div>
          </main>
        )}
      </div>
      <Footer />
    </>
  );
};
