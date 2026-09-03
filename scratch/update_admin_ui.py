import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace AdminDashboardPage
admin_dashboard = """
export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [stats, setStats] = React.useState(null);
  const [shops, setShops] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useSelector(state => state.auth || {});

  React.useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } else if (tab === 'shops') {
        const res = await api.get('/admin/shops?limit=50');
        setShops(res.data.shops);
      } else if (tab === 'users') {
        const res = await api.get('/admin/users?limit=50');
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyShop = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this shop as ${status}?`)) return;
    try {
      await api.put(`/admin/shops/${id}/verification`, { status });
      fetchData('shops');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating shop');
    }
  };

  const handleUserStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this user?`)) return;
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      fetchData('users');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-10 text-center text-red-500 font-bold">Unauthorized. Super Admin access required.</div>;
  }

  return (
    <PageShell eyebrow="Super Admin" title="Platform Management" description="Central administration for marketplace control.">
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['dashboard', 'shops', 'users'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-bold capitalize whitespace-nowrap transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : activeTab === 'dashboard' && stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Customers</h3>
            <p className="text-4xl font-black text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Shops</h3>
            <p className="text-4xl font-black text-slate-900">{stats.totalShops}</p>
            <p className="text-sm font-medium text-slate-500 mt-2">{stats.verifiedShops} Verified • {stats.pendingShops} Pending</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</h3>
            <p className="text-4xl font-black text-green-600">₹{stats.totalRevenue}</p>
            <p className="text-sm font-medium text-slate-500 mt-2">From {stats.completedBookings} completed bookings</p>
          </div>
        </div>
      ) : activeTab === 'shops' ? (
        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{shop.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${shop.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : shop.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {shop.verificationStatus}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{shop.owner?.name} • {shop.city}, {shop.state}</p>
              </div>
              <div className="flex gap-2">
                {shop.verificationStatus !== 'approved' && (
                  <button onClick={() => handleVerifyShop(shop._id, 'approved')} className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800">Approve</button>
                )}
                {shop.verificationStatus !== 'rejected' && (
                  <button onClick={() => handleVerifyShop(shop._id, 'rejected')} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100">Reject</button>
                )}
                {shop.verificationStatus === 'approved' && (
                  <button onClick={() => handleVerifyShop(shop._id, 'suspended')} className="px-4 py-2 bg-orange-50 text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-100">Suspend</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'users' ? (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{u.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{u.email} • Role: {u.role}</p>
              </div>
              {u.role !== 'admin' && (
                <div className="flex gap-2">
                  {u.status === 'active' ? (
                    <button onClick={() => handleUserStatus(u._id, 'suspended')} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100">Suspend</button>
                  ) : (
                    <button onClick={() => handleUserStatus(u._id, 'active')} className="px-4 py-2 bg-green-50 text-green-600 font-bold text-sm rounded-xl hover:bg-green-100">Reactivate</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
};
"""

content = re.sub(
    r"export const AdminDashboardPage = \(\) => \([\s\S]*?This dashboard can be connected to the admin backend when ready\.<\/p>\s*<\/div>\s*\)\)}\s*<\/div>\s*<\/PageShell>\s*\);",
    admin_dashboard,
    content
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminDashboardPage in UiPages.jsx")
