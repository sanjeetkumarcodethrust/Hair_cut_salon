import re

with open('backend/seedSalons.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("name: 'Urban Cuts & Shave Lounge',", "name: 'Urban Cuts & Shave Lounge',\n        activeOffer: { title: '20% OFF Fade', isActive: true, discountValue: '20%' },")
content = content.replace("name: 'Style Studio Unisex Salon',", "name: 'Style Studio Unisex Salon',\n        activeOffer: { title: '10% OFF Color', isActive: true, discountValue: '10%' },")

with open('backend/seedSalons.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated seedSalons.js")
