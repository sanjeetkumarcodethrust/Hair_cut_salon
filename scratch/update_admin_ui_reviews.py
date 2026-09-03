import re

with open('backend/routes/adminRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import {\n  getDashboardStats,\n  getUsers,\n  updateUserStatus,\n  getShops,\n  updateShopVerification,\n  getBookings,\n  getAuditLogs,\n  getAdminReviews,\n  moderateReview\n} from '../controllers/adminController.js';"

content = re.sub(r"import \{[\s\S]*?\} from '\.\./controllers/adminController\.js';", import_str, content)

reviews_routes = """
// Reviews
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);
"""
content = content + "\n" + reviews_routes

with open('backend/routes/adminRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated adminRoutes.js with Review Moderation")

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    ui_content = f.read()

ui_tabs = """        {['dashboard', 'shops', 'users', 'reviews', 'logs'].map(tab => ("""
ui_content = re.sub(r"\{\['dashboard', 'shops', 'users'\]\.map\(tab => \(", ui_tabs, ui_content)

ui_states = """  const [reviews, setReviews] = React.useState([]);\n  const [logs, setLogs] = React.useState([]);"""
ui_content = ui_content.replace("  const [users, setUsers] = React.useState([]);", "  const [users, setUsers] = React.useState([]);\n" + ui_states)

ui_fetch = """      } else if (tab === 'users') {
        const res = await api.get('/admin/users?limit=50');
        setUsers(res.data.users);
      } else if (tab === 'reviews') {
        const res = await api.get('/admin/reviews?limit=50');
        setReviews(res.data.reviews);
      } else if (tab === 'logs') {
        const res = await api.get('/admin/audit-logs?limit=50');
        setLogs(res.data.logs);
      }"""
ui_content = re.sub(r"\} else if \(tab === 'users'\) \{[\s\S]*?setUsers\(res\.data\.users\);\s*\}", ui_fetch, ui_content)

ui_review_methods = """
  const handleModerateReview = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this review as ${status}?`)) return;
    try {
      await api.put(`/admin/reviews/${id}/moderate`, { status, reason: 'Admin moderation' });
      fetchData('reviews');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating review');
    }
  };
"""
ui_content = ui_content.replace("  const handleUserStatus = async (id, status) => {", ui_review_methods + "\n  const handleUserStatus = async (id, status) => {")

ui_review_render = """
      ) : activeTab === 'reviews' ? (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">Review by {r.customer?.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${r.status === 'published' ? 'bg-green-100 text-green-700' : r.status === 'reported' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Shop: {r.salon?.name} • Rating: {r.rating} ★</p>
                <p className="text-sm text-slate-700 mt-2">"{r.comment}"</p>
              </div>
              <div className="flex gap-2">
                {r.status !== 'published' && (
                  <button onClick={() => handleModerateReview(r._id, 'published')} className="px-4 py-2 bg-green-50 text-green-600 font-bold text-sm rounded-xl hover:bg-green-100">Publish</button>
                )}
                {r.status !== 'hidden' && (
                  <button onClick={() => handleModerateReview(r._id, 'hidden')} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200">Hide</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'logs' ? (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-bold text-slate-900">{log.admin?.name || 'Admin'} performed: <span className="text-primary">{log.action}</span></p>
                <p className="text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-xs text-slate-500">Target: {log.targetType} ({log.targetId})</p>
              {log.reason && <p className="text-xs text-slate-500 mt-1">Reason: {log.reason}</p>}
            </div>
          ))}
        </div>
"""

ui_content = ui_content.replace(") : null}", ui_review_render + "\n      ) : null}")

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(ui_content)
print("Updated UiPages.jsx with Review Moderation and Audit Logs")
