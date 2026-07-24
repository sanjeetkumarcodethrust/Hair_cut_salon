import { motion } from 'framer-motion';

const PageShell = ({ eyebrow, title, description, actions, children }) => (
  <div className="min-h-full bg-transparent px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70"
    >
      <div className="border-b border-slate-200/70 bg-gradient-to-r from-primary/10 via-white/80 to-violet-500/10 px-6 py-8 sm:px-8 lg:px-10 dark:border-slate-800/80 dark:from-primary/20 dark:via-slate-900/70 dark:to-violet-500/20">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p> : null}
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07, duration: 0.35 }}
        className="px-6 py-8 sm:px-8 lg:px-10"
      >
        {children}
      </motion.div>
    </motion.section>
  </div>
);

export default PageShell;
