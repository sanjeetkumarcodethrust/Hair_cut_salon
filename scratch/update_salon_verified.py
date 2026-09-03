import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update getAllSalons
content = re.sub(
    r"const query = \{ name: \{ \$regex: keyword, \$options: 'i' \} \};",
    "const query = { name: { $regex: keyword, $options: 'i' }, verificationStatus: 'approved', isActive: true };",
    content
)
content = re.sub(
    r"const query = \{\};",
    "const query = { verificationStatus: 'approved', isActive: true };",
    content
)

# Update getNearbySalons
content = re.sub(
    r"const query = \{\s*location:\s*\{\s*\$geoWithin:\s*\{\s*\$centerSphere: \[\[lng, lat\], radius / 3963\.2\]\s*\}\s*\}\s*\};",
    "const query = { location: { $geoWithin: { $centerSphere: [[lng, lat], radius / 3963.2] } }, verificationStatus: 'approved', isActive: true };",
    content
)

# Update searchSalons
content = re.sub(
    r"const filter = \{\};",
    "const filter = { verificationStatus: 'approved', isActive: true };",
    content
)

with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated salonController.js to enforce verificationStatus: 'approved'")
