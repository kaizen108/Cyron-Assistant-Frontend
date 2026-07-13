import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import { TopNav } from '../../components/layout/TopNav';
import { Footer } from '../../components/layout/Footer';
import { DOC_QUICK_START, DOC_SECTIONS } from './docsContent';
import { DocsCommandCard } from './DocsCommandCard';
import { DocsMobileNav, DocsSidebar } from './DocsSidebar';

export function Docs() {
  const [activeSectionId, setActiveSectionId] = useState(DOC_SECTIONS[0].id);

  const scrollToSection = useCallback((id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(`doc-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) setActiveSectionId(id);
          }
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 },
    );

    DOC_SECTIONS.forEach((s) => {
      const el = document.getElementById(`doc-section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const totalTopics = DOC_SECTIONS.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <TopNav currentGuildName={null} />
      <div className="min-h-screen bg-bg-base dark:bg-[#0b1120]">
          {/* Hero */}
          <section className="border-b border-slate-200/80 dark:border-slate-800">
            <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 lg:px-6">
              <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
                Docs
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
                Every feature, every command,{' '}
                <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                  one place.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                The complete reference for server admins and support staff. Setup, dashboard
                panels, AI knowledge, Discord commands, permissions, and troubleshooting — from
                first invite to production.
              </p>
              <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-500">
                {DOC_SECTIONS.length} sections · {totalTopics} topics
              </p>
            </div>
          </section>

          {/* Quick start cards */}
          <section className="border-b border-slate-200/80 dark:border-slate-800">
            <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-2 lg:px-6">
              {DOC_QUICK_START.map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-lg dark:border-slate-700"
                >
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-800/80">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/40">
                      <FaPlay className="ml-1 h-5 w-5" aria-hidden />
                    </div>
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Walkthrough coming soon
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold">{card.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{card.subtitle}</p>
                  <span className="absolute bottom-5 right-5 font-mono text-xs text-slate-500">
                    {card.duration}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Main docs layout: sidebar + content */}
          <div className="mx-auto flex max-w-6xl items-start gap-8 px-4 py-10 lg:px-6 lg:py-12">
            <DocsSidebar
              sections={DOC_SECTIONS}
              activeId={activeSectionId}
              onSelect={scrollToSection}
            />

            <div className="min-w-0 flex-1 lg:min-h-[calc(100vh-4.5rem)]">
              <DocsMobileNav
                sections={DOC_SECTIONS}
                activeId={activeSectionId}
                onSelect={scrollToSection}
              />

              <div className="space-y-16">
                {DOC_SECTIONS.map((section) => (
                  <section
                    key={section.id}
                    id={`doc-section-${section.id}`}
                    data-section-id={section.id}
                    className="scroll-mt-24"
                  >
                    <header className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-700">
                      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
                        {section.tag}
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                        {section.title}
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {section.description}
                      </p>
                    </header>

                    <div className="space-y-4">
                      {section.items.map((item) => (
                        <DocsCommandCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-16 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-8 text-center dark:border-sky-500/20 dark:from-sky-500/10 dark:to-indigo-500/5">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Ready to configure your server?
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Open the dashboard to create panels, add knowledge, and send your first ticket
                  panel to Discord.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      <Footer />
    </>
  );
}

export default Docs;
