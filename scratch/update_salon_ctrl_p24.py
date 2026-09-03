import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(".populate('owner', 'name email');", ".populate('owner', 'name email').populate('business', 'name logo');")
content = content.replace(".populate('owner', 'name email')", ".populate('owner', 'name email').populate('business', 'name logo')")

with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated salonController.js')
