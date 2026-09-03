import re

with open('scratch/update_uipages_p22.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '''content = re.sub(
    r"<div className=\\"grid gap-4 md:grid-cols-2 xl:grid-cols-3\\">[\\s\\S]*?<\\/PageShell>",
    owner_ui,
    content
)''',
    '''content = content.replace(
    "      <div className=\\"grid gap-4 md:grid-cols-2 xl:grid-cols-3\\\">\\n        {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (\\n          <div key={item} className=\\"rounded-2xl border border-slate-200 bg-white p-6 shadow-sm\\">\\n            <h3 className=\\"text-lg font-semibold text-slate-900\\">{item}</h3>\\n            <p className=\\"mt-2 text-sm text-slate-600\\">This workspace is ready for owner-specific management views.</p>\\n          </div>\\n        ))}\\n      </div>\\n    </PageShell>",
    owner_ui
)'''
)

with open('scratch/update_uipages_p22.py', 'w', encoding='utf-8') as f:
    f.write(content)
