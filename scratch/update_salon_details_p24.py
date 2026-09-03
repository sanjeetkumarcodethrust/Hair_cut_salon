import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_header = """<h1 className="text-3xl font-black text-slate-900">{salon.name}</h1>"""
new_header = """<h1 className="text-3xl font-black text-slate-900">{salon.business ? `${salon.business.name} — ${salon.branchName || salon.name}` : salon.name}</h1>"""

content = content.replace(old_header, new_header)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated SalonDetails in UiPages.jsx')
