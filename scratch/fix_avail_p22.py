import re

with open('backend/services/availabilityService.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const startOfDay = reqDate.clone().startOf('day');", "const _startOfDay = reqDate.clone().startOf('day');", 1)
content = content.replace("const endOfDay = reqDate.clone().endOf('day');", "const _endOfDay = reqDate.clone().endOf('day');", 1)

content = content.replace("startDate: { $lte: endOfDay.toDate() },", "startDate: { $lte: _endOfDay.toDate() },")
content = content.replace("endDate: { $gte: startOfDay.toDate() }", "endDate: { $gte: _startOfDay.toDate() }")

with open('backend/services/availabilityService.js', 'w', encoding='utf-8') as f:
    f.write(content)
