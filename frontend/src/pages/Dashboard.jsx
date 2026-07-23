import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CalendarDays,
  CalendarClock,
  Wallet,
  Heart,
  Star,
  Scissors,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  Loader2,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

const sectionOrder = {
  customer: ['upcomingAppointments', 'history', 'favorites', 'reviews', 'payments'],
  barber: ['schedule', 'earnings', 'reviews', 'jobApplications', 'availability'],
  owner: ['salons', 'staff', 'revenue', 'bookings', 'jobs', 'applicants', 'reports'],
  admin: ['users', 'salons', 'barbers', 'reports', 'analytics'],
};

const summaryIcons = {
  customer: [CalendarDays, Wallet, Heart, Star],
  barber: [CalendarClock, Wallet, Star, Briefcase],
  owner: [Building2, Users, Wallet, CalendarDays],
  admin: [Users, Building2, Scissors, BarChart3],
};

const toneClasses = {
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  violet: 'from-violet-500 to-fuchsia-500',
  slate: 'from-slate-500 to-slate-700',
};

const statusClasses = {
  open: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-rose-50 text-rose-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-600',
  reviewed: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-violet-50 text-violet-700',
  rejected: 'bg-rose-50 text-rose-700',
  hired: 'bg-emerald-50 text-emerald-700',
  favorite: 'bg-pink-50 text-pink-700',
  review: 'bg-indigo-50 text-indigo-700',
  earnings: 'bg-emerald-50 text-emerald-700',
  report: 'bg-slate-100 text-slate-600',
  analytics: 'bg-slate-100 text-slate-600',
  salon: 'bg-sky-50 text-sky-700',
  barber: 'bg-purple-50 text-purple-700',
  user: 'bg-slate-100 text-slate-700',
};

const fetchDashboard = async (signal) => {
  const response = await fetch('/api/dashboard/overview', {
    credentials: 'include',
    signal,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Failed to load dashboard');
  }

  return payload;
};

const SummaryCard = ({ card, Icon }) => (
  <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur">
    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses[card.tone] || toneClasses.slate} text-white shadow-lg shadow-slate-200`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="mt-4 text-sm font-medium text-slate-500">{card.label}</p>
    <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
    <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
  </article>
);

const SectionCard = ({ section }) => (
  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{section.emptyMessage}</p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {section.items.length} items
      </span>
    </div>

    {section.items.length > 0 ? (
      <div className="mt-5 space-y-3">
        {section.items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  {item.badge ? (
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusClasses[item.badge] || 'bg-slate-100 text-slate-600'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                {item.subtitle ? <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p> : null}
                {item.meta ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.meta}</p> : null}
              </div>
              {item.value ? (
                <div className="text-left sm:text-right">
                  <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        {section.emptyMessage}
      </div>
    )}
  </section>
);

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchDashboard(controller.signal);
        setDashboard(data);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    return () => controller.abort();
  }, [userInfo]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const role = dashboard?.role || userInfo.role;
  const roleLabel = dashboard?.roleLabel || role;
  const summary = dashboard?.summary || [];
  const sections = dashboard?.sections || {};
  const sectionKeys = sectionOrder[role] || [];
  const summaryIconList = summaryIcons[role] || summaryIcons.customer;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(29,78,216,0.10),_transparent_34%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[2rem] border border-white/70 bg-slate-900 px-6 py-8 text-white shadow-2xl shadow-slate-300/40 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{roleLabel} dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {userInfo.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Your workspace is grouped by role so you can jump straight to appointments, bookings, jobs, revenue, and analytics.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur">
              <p className="font-medium">Signed in as</p>
              <p className="text-slate-300">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading dashboard...
            </div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <p className="font-semibold">Dashboard unavailable</p>
                <p className="mt-1 text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summary.map((card, index) => {
                const Icon = summaryIconList[index] || summaryIconList[0] || CalendarDays;
                return <SummaryCard key={card.label} card={card} Icon={Icon} />;
              })}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {sectionKeys.map((key) => {
                const section = sections[key];
                if (!section) return null;
                return <SectionCard key={key} section={section} />;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
