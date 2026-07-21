import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';
import {
  FaBook,
  FaRobot,
  FaPalette,
  FaChartLine,
  FaServer,
  FaLayerGroup,
  FaBrain,
  FaBars,
  FaTimes,
  FaTicketAlt,
  FaCog,
} from 'react-icons/fa';

type Tab = {
  id: string;
  label: string;
  to: (id: string) => string;
  icon: React.ReactNode;
};

type Section = {
  id: string;
  label: string;
  tabs: Tab[];
};

const sections: Section[] = [
  {
    id: 'management',
    label: 'Management',
    tabs: [
      {
        id: 'panels',
        label: 'Panels',
        to: (id: string) => `/guilds/${id}/panels`,
        icon: <FaLayerGroup className="mr-2 w-4 h-4" />,
      },
      {
        id: 'contexts',
        label: 'AI Contexts',
        to: (id: string) => `/guilds/${id}/contexts`,
        icon: <FaBrain className="mr-2 w-4 h-4" />,
      },
      {
        id: 'knowledge',
        label: 'Knowledge',
        to: (id: string) => `/guilds/${id}/knowledge`,
        icon: <FaBook className="mr-2 w-4 h-4" />,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    tabs: [
      {
        id: 'ai-settings',
        label: 'AI Settings',
        to: (id: string) => `/guilds/${id}/ai-settings`,
        icon: <FaRobot className="mr-2 w-4 h-4" />,
      },
      {
        id: 'embed-customization',
        label: 'Embed Customization',
        to: (id: string) => `/guilds/${id}/embed-customization`,
        icon: <FaPalette className="mr-2 w-4 h-4" />,
      },
      {
        id: 'close-settings',
        label: 'Close Settings',
        to: (id: string) => `/guilds/${id}/close-settings`,
        icon: <FaCog className="mr-2 w-4 h-4" />,
      },
      {
        id: 'usage-analytics',
        label: 'Usage Analytics',
        to: (id: string) => `/guilds/${id}/usage-analytics`,
        icon: <FaChartLine className="mr-2 w-4 h-4" />,
      },
      {
        id: 'tickets',
        label: 'Ticket Management',
        to: (id: string) => `/guilds/${id}/tickets`,
        icon: <FaTicketAlt className="mr-2 w-4 h-4" />,
      },
    ],
  },
];

const allTabs = sections.flatMap((s) => s.tabs);

type GuildSidebarNavProps = {
  guild?: Guild | null;
};

export const GuildSidebarNav = ({ guild }: GuildSidebarNavProps) => {
  const { guildId } = useParams<{ guildId?: string }>();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useApp();

  if (!guildId) return null;

  const displayName = (() => {
    const name = guild?.name?.trim() || 'Server';
    const MAX = 16;
    return name.length > MAX ? `${name.slice(0, MAX)}…` : name;
  })();

  const planLabel = (() => {
    const p = (guild?.plan ?? 'free').toLowerCase();
    if (p === 'business') return 'Business plan';
    if (p === 'pro') return 'Pro plan';
    return 'Free plan';
  })();

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-4">
      {sections.map((section) => (
        <div key={section.id}>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {section.label}
          </p>
          <div className="space-y-1">
            {section.tabs.map((tab) => {
              const target = tab.to(guildId);
              const isActive = location.pathname.startsWith(target);
              return (
                <Link
                  key={tab.id}
                  to={target}
                  onClick={onClick}
                  className={clsx(
                    'flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? theme === 'dark'
                        ? 'bg-sky-900/40 text-sky-300 border border-sky-800'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                      : theme === 'dark'
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar — original styling preserved */}
      <aside className={clsx(
        'hidden w-56 flex-shrink-0 rounded-2xl border px-3 py-4 text-sm shadow-sm md:block sticky top-20 self-start',
        theme === 'dark'
          ? 'border-slate-700 bg-slate-900 text-slate-200'
          : 'border-slate-200 bg-white text-slate-800'
      )}>
        <div className={clsx(
          'mb-4 px-1',
        )}>
          <div className={clsx(
            'flex items-center gap-2 rounded-xl border px-2.5 py-2',
            theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
          )}>
            {guild?.icon_url ? (
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={guild.icon_url}
                  alt={guild.name ?? 'Server icon'}
                  className="h-full w-full object-cover"
                />
              </span>
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <FaServer className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{planLabel}</p>
            </div>
          </div>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className={clsx(
        'md:hidden fixed top-[49px] left-0 right-0 z-20 flex items-center justify-between border-b px-4 py-2 backdrop-blur-sm',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/95' : 'border-slate-200 bg-white/95'
      )}>
        <span className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{displayName}</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
        >
          <FaBars className="h-3.5 w-3.5" />
          Menu
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className={clsx(
            'relative ml-auto w-64 max-w-[85vw] h-full shadow-xl px-4 py-5 overflow-y-auto',
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          )}>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <span className="text-sm font-semibold text-slate-900">{displayName}</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
            <NavLinks onClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile bottom quick-nav */}
      <nav className={clsx(
        'md:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t backdrop-blur-sm',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/95' : 'border-slate-200 bg-white/95'
      )}>
        {allTabs.slice(0, 5).map((tab) => {
          const target = tab.to(guildId);
          const isActive = location.pathname.startsWith(target);
          return (
            <Link
              key={tab.id}
              to={target}
              className={[
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-sky-600' : 'text-slate-500',
              ].join(' ')}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
