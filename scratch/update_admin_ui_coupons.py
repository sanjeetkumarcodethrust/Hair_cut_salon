import re

with open('backend/routes/adminRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"moderateReview\n\} from", "moderateReview,\n  getAdminCoupons\n} from", content)

coupons_routes = """
// Coupons
router.get('/coupons', getAdminCoupons);
"""
content = content + "\n" + coupons_routes

with open('backend/routes/adminRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    ui_content = f.read()

ui_tabs = """        {['dashboard', 'shops', 'users', 'reviews', 'coupons', 'logs'].map(tab => ("""
ui_content = re.sub(r"\{\['dashboard', 'shops', 'users', 'reviews', 'logs'\]\.map\(tab => \(", ui_tabs, ui_content)

ui_states = """  const [adminCoupons, setAdminCoupons] = React.useState([]);"""
ui_content = ui_content.replace("  const [logs, setLogs] = React.useState([]);", "  const [logs, setLogs] = React.useState([]);\n" + ui_states)

ui_fetch = """      } else if (tab === 'logs') {
        const res = await api.get('/admin/audit-logs?limit=50');
        setLogs(res.data.logs);
      } else if (tab === 'coupons') {
        const res = await api.get('/admin/coupons?limit=50');
        setAdminCoupons(res.data.coupons);
      }"""
ui_content = re.sub(r"\} else if \(tab === 'logs'\) \{[\s\S]*?setLogs\(res\.data\.logs\);\s*\}", ui_fetch, ui_content)

ui_coupon_render = """
      ) : activeTab === 'coupons' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminCoupons.map(c => (
            <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-slate-900">{c.code}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">{c.salon?.name || 'Unknown Shop'}</p>
                <p className="text-primary font-bold text-sm mb-4">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </p>
                <p className="text-xs text-slate-500 mb-1">Min Order: ₹{c.minOrderValue}</p>
                <p className="text-xs text-slate-500">Usage: {c.usageCount} / {c.usageLimit || 'Unlimited'}</p>
              </div>
            </div>
          ))}
          {adminCoupons.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No coupons active on platform.</p>}
        </div>
"""

ui_content = ui_content.replace(") : activeTab === 'logs' ? (", ui_coupon_render + "\n      ) : activeTab === 'logs' ? (")

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(ui_content)

print("Updated adminRoutes.js and UiPages.jsx with Admin Coupons")
