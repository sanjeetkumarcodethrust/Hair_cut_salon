import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the initial states and effect in OwnerDashboardPage
old_state = """    const [salon, setSalon] = React.useState(null);
    
    // Phase 22 States
    const [leaveRequests, setLeaveRequests] = React.useState([]);

    // Phase 23 Analytics States
    const [analytics, setAnalytics] = React.useState(null);
    const [topServices, setTopServices] = React.useState([]);

    React.useEffect(() => {
       api.get('/salons').then(res => {
           const mySalon = res.data.data.find(s => s.owner?._id === user?._id || s.owner === user?._id);
           if (mySalon) {
               setSalon(mySalon);
               api.get(`/workforce/leave/shop/${mySalon._id}`).then(lr => setLeaveRequests(lr.data.leaves)).catch(console.error);
               api.get(`/analytics/shop/${mySalon._id}/overview`).then(ar => setAnalytics(ar.data.stats)).catch(console.error);
               api.get(`/analytics/shop/${mySalon._id}/services`).then(sr => setTopServices(sr.data.services.slice(0,5))).catch(console.error);
           }
       }).catch(console.error);
    }, [user]);"""

new_state = """    const [business, setBusiness] = React.useState(null);
    const [branches, setBranches] = React.useState([]);
    const [selectedBranchId, setSelectedBranchId] = React.useState('all');
    
    // Current context
    const isConsolidated = selectedBranchId === 'all';
    const activeBranch = isConsolidated ? null : branches.find(b => b._id === selectedBranchId);

    // For legacy UI that expects 'salon'
    const salon = activeBranch || (branches.length > 0 ? branches[0] : null);

    // Analytics States
    const [analytics, setAnalytics] = React.useState(null);
    const [topServices, setTopServices] = React.useState([]);
    const [leaveRequests, setLeaveRequests] = React.useState([]);

    React.useEffect(() => {
      api.get('/business/me').then(res => {
        setBusiness(res.data.business);
        setBranches(res.data.branches);
      }).catch(console.error);
    }, [user]);

    React.useEffect(() => {
      if (isConsolidated && business) {
        // Fetch consolidated
        api.get(`/business/${business._id}/analytics`).then(res => setAnalytics(res.data.stats)).catch(console.error);
        setTopServices([]); // Not showing top services for consolidated yet
        setLeaveRequests([]);
      } else if (activeBranch) {
        api.get(`/analytics/shop/${activeBranch._id}/overview`).then(res => setAnalytics(res.data.stats)).catch(console.error);
        api.get(`/analytics/shop/${activeBranch._id}/services`).then(res => setTopServices(res.data.services.slice(0,5))).catch(console.error);
        api.get(`/workforce/leave/shop/${activeBranch._id}`).then(res => setLeaveRequests(res.data.leaves)).catch(console.error);
      }
    }, [business, selectedBranchId, activeBranch]);"""

content = content.replace(old_state, new_state)

old_heading = """      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Owner Dashboard</h1>
          <p className="mt-1 text-slate-500">Manage your salon, services, and operations.</p>
        </div>
      </div>"""

new_heading = """      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{business ? business.name : 'Owner Dashboard'}</h1>
          <p className="mt-1 text-slate-500">Manage your brand, branches, and operations.</p>
        </div>
        
        {branches.length > 0 && (
          <select 
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl font-bold bg-white text-slate-900"
          >
            {user?.role === 'owner' && <option value="all">All Branches (Consolidated)</option>}
            {branches.map(b => (
              <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
            ))}
          </select>
        )}
      </div>"""

content = content.replace(old_heading, new_heading)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated Owner Dashboard UI for Business Support.')
