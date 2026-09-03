import re

with open('backend/routes/customerPreferenceRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("getRecentlyViewed,", "getRecentlyViewed,\n  getRecommendedSalons,")
content = content.replace("export default router;", "router.get('/recommended', protect, getRecommendedSalons);\n\nexport default router;")

with open('backend/routes/customerPreferenceRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated customerPreferenceRoutes.js with recommendations")
