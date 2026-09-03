import re

with open('backend/routes/analyticsRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_logic = """    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }
    
    const isOwner = salon.owner.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager' && req.user.managedBranches && req.user.managedBranches.includes(salon._id.toString());
    
    if (!isOwner && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized for this shop\\'s analytics' });
    }"""

content = re.sub(r"    if \(req\.user\.role === 'admin' \|\| req\.user\.role === 'superadmin'\) \{[\s\S]*?Not authorized for this shop\\'s analytics' \}\);\s*\}", new_logic, content)

with open('backend/routes/analyticsRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated analyticsRoutes.js')
