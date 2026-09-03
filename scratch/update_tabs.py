import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Customer Support Tab
# find dashboard tabs:
dashboard_tabs = """        {['upcoming', 'history', 'saved', 'rewards', 'support'].map(tab => ("""
content = re.sub(r"\{\['upcoming', 'history', 'saved', 'rewards'\]\.map\(tab => \(", dashboard_tabs, content)

# 2. Owner Support Tab
owner_tabs = """        {['dashboard', 'appointments', 'services', 'offers', 'support'].map(tab => ("""
content = re.sub(r"\{\['dashboard', 'appointments', 'services', 'offers'\]\.map\(tab => \(", owner_tabs, content)

# 3. Admin Support Tab
admin_tabs = """        {['dashboard', 'shops', 'users', 'reviews', 'coupons', 'support', 'logs'].map(tab => ("""
content = re.sub(r"\{\['dashboard', 'shops', 'users', 'reviews', 'coupons', 'logs'\]\.map\(tab => \(", admin_tabs, content)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Tabs in UiPages.jsx")
