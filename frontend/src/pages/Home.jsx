import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Compass, Scissors, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Instant booking',
    description: 'Reserve a visit in seconds with smart time slots and instant availability.',
    icon: CalendarDays,
  },
  {
    title: 'Curated discovery',
    description: 'Browse premium salons and barbers with polished details and real reviews.',
    icon: Compass,
  },
  {
    title: 'Trusted experience',
    description: 'Secure confirmations, reminders, and professional management tools.',
    icon: ShieldCheck,
  },
];

const stats = [
  { label: 'Clients served', value: '12k+' },
  { label: '5-star reviews', value: '4.9/5' },
  { label: 'Live availability', value: '24/7' },
];

const Home = () => {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/70 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70"
        >
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:border-primary/30 dark:bg-primary/20">
                <Sparkles className="h-4 w-4" />
                Premium salon discovery experience
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Book your next haircut with a polished, modern touch.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Discover world-class salons, expert barbers, and flexible appointments in one beautifully designed booking flow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/salons" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90">
                  Browse salons <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/landing" className="rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
                  Explore full UI
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-primary/10 via-white/80 to-violet-500/10 p-5 shadow-inner dark:border-slate-800 dark:from-primary/15 dark:via-slate-950/80 dark:to-violet-500/15">
              <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Featured right now</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Luxe Cuts Studio</p>
                  </div>
                  <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    4.9 ★
                  </div>
                </div>

                <div className="mt-5 rounded-[1.25rem] bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Signature haircut</p>
                      <p className="text-lg font-semibold">Today • 4:30 PM</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {['Luxury styling', 'Expert barbers', 'Flexible reminders'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                      <span>{item}</span>
                      <Star className="h-4 w-4 text-amber-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.35 }}
                className="glass-panel p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary dark:text-sky-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
