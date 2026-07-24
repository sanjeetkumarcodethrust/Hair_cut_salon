const PageShell = ({ eyebrow, title, description, actions, children }) => (
  <div className="bg-light">
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p> : null}
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 text-base leading-7 text-slate-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
  </div>
);

export default PageShell;
