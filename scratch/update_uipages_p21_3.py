import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

owner_dashboard = """
export const OwnerDashboardPage = () => {
  const { user } = useSelector(state => state.auth || {});
  const [salon, setSalon] = React.useState(null);
  
  React.useEffect(() => {
     // Fetch the owner's salon to manage
     api.get('/salons').then(res => {
         const mySalon = res.data.data.find(s => s.owner?._id === user?._id || s.owner === user?._id);
         if (mySalon) setSalon(mySalon);
     }).catch(console.error);
  }, [user]);

  const toggleWalkIns = async () => {
      try {
          const res = await api.patch(`/queue/shop/${salon._id}/toggle`, { walkInsEnabled: !salon.walkInsEnabled });
          setSalon(prev => ({ ...prev, walkInsEnabled: res.data.walkInsEnabled }));
          toast.success(res.data.walkInsEnabled ? 'Walk-ins Enabled' : 'Walk-ins Paused');
      } catch (err) {
          toast.error('Failed to toggle walk-ins');
      }
  };

  return (
    <PageShell eyebrow="Owner dashboard" title="Run your salon operations" description="Monitor staff activity, revenue, and queue.">
      <div className="mb-6 flex justify-end gap-4">
        {salon && (
           <button onClick={toggleWalkIns} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition ${salon.walkInsEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
             {salon.walkInsEnabled ? 'Pause Walk-ins' : 'Resume Walk-ins'}
           </button>
        )}
        <Link to="/salons/new" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
          + Add New Salon
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
            <p className="mt-2 text-sm text-slate-600">This workspace is ready for owner-specific management views.</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
};
"""

content = re.sub(
    r"export const OwnerDashboardPage = \(\) => \([\s\S]*?<\/PageShell>\s*\);",
    owner_dashboard,
    content
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OwnerDashboardPage for Phase 21")
