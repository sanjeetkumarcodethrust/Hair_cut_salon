import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

barber_dashboard_code = """
export const BarberDashboardPage = () => {
  const { user } = useSelector(state => state.auth || {});
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'barber' && user.role !== 'owner' && user.role !== 'admin') {
      return navigate('/');
    }
    fetchDashboard();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/staff/appointments/${id}/status`, { status: newStatus });
      fetchDashboard();
      toast.success(`Booking marked as ${newStatus}`);
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading && !data) {
    return (
      <PageShell eyebrow="Staff Dashboard" title="Daily Operations">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell eyebrow="Staff Dashboard" title="Daily Operations">
        <div className="text-center py-20 text-red-500 font-bold">{error}</div>
      </PageShell>
    );
  }

  const { todayStats, currentAppointment, nextAppointment, timeline } = data;

  return (
    <PageShell eyebrow="Staff Dashboard" title={`Welcome back, ${data.barberName || 'Barber'}`} description="Manage your daily operations and client workflow.">
      
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</h3>
            <p className="text-3xl font-black text-slate-900">{todayStats.completed}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
             <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Upcoming</h3>
            <p className="text-3xl font-black text-slate-900">{todayStats.upcoming}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
             <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Bookings</h3>
            <p className="text-3xl font-black text-slate-900">{todayStats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
             <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Now Serving */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Now Serving
          </h2>
          {currentAppointment ? (
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
               <div className="flex items-center justify-between mb-6 relative z-10">
                 <span className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-primary/30">
                   {currentAppointment.status.replace('_', ' ')}
                 </span>
                 <span className="font-semibold text-slate-300">{currentAppointment.startTime} - {currentAppointment.endTime}</span>
               </div>
               
               <div className="flex items-center gap-4 mb-6 relative z-10">
                 <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20 shrink-0">
                   {currentAppointment.customerImage ? <img src={currentAppointment.customerImage} className="w-full h-full rounded-full object-cover" /> : currentAppointment.customerName.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold">{currentAppointment.customerName}</h3>
                   <p className="text-slate-400 font-medium">{currentAppointment.customerPhone || 'Walk-in'}</p>
                 </div>
               </div>
               
               <div className="bg-black/20 rounded-2xl p-4 mb-6 relative z-10 border border-white/5">
                 <p className="text-sm text-slate-400 font-bold mb-2 uppercase tracking-wider">Services</p>
                 <div className="space-y-1.5">
                   {currentAppointment.services.map((s, i) => (
                     <div key={i} className="flex justify-between items-center text-sm font-semibold">
                       <span>{s.name}</span>
                       <span className="text-slate-400">{s.duration}m</span>
                     </div>
                   ))}
                 </div>
                 <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-bold text-sm">
                    <span>Total Duration</span>
                    <span className="text-primary">{currentAppointment.totalDuration} min</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 relative z-10">
                 {currentAppointment.status === 'confirmed' && (
                   <>
                     <button onClick={() => handleStatusUpdate(currentAppointment._id, 'arrived')} className="col-span-2 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]">Mark Arrived</button>
                     <button onClick={() => handleStatusUpdate(currentAppointment._id, 'no_show')} className="col-span-2 py-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition">No Show</button>
                   </>
                 )}
                 {(currentAppointment.status === 'arrived' || currentAppointment.status === 'confirmed') && (
                   <button onClick={() => handleStatusUpdate(currentAppointment._id, 'in_progress')} className="col-span-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-[0_0_20px_rgba(139,92,246,0.4)]">Start Service</button>
                 )}
                 {currentAppointment.status === 'in_progress' && (
                   <button onClick={() => handleStatusUpdate(currentAppointment._id, 'completed')} className="col-span-2 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-[0_0_20px_rgba(16,185,129,0.4)]">Complete Service</button>
                 )}
               </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-200/50 rounded-full flex items-center justify-center text-slate-400 mb-4"><Coffee className="w-8 h-8" /></div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">No active booking</h3>
              <p className="text-sm font-medium text-slate-500">You are currently free or on a break.</p>
            </div>
          )}
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
           <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
             <Calendar className="w-5 h-5 text-primary" />
             Today's Schedule
           </h2>
           
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             {timeline.length === 0 ? (
                <div className="p-10 text-center text-slate-500 font-medium">No bookings scheduled for today.</div>
             ) : (
                <div className="divide-y divide-slate-100">
                  {timeline.map((apt, index) => (
                    <div key={apt._id} className={`p-5 md:p-6 transition hover:bg-slate-50 flex flex-col md:flex-row md:items-center gap-4 ${apt.computedState === 'current' ? 'bg-primary/5 border-l-4 border-primary' : apt.computedState === 'completed' ? 'opacity-60 grayscale' : ''}`}>
                      <div className="flex flex-col md:w-32 shrink-0">
                        <span className="font-bold text-slate-900 text-lg">{apt.startTime}</span>
                        <span className="text-sm font-medium text-slate-500">{apt.endTime}</span>
                      </div>
                      
                      <div className="flex-grow flex flex-col md:flex-row md:items-center gap-4 justify-between">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 border border-slate-200 overflow-hidden">
                             {apt.customerImage ? <img src={apt.customerImage} className="w-full h-full object-cover" /> : apt.customerName.charAt(0)}
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-900">{apt.customerName}</h4>
                             <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">{apt.services.map(s => s.name).join(' + ')}</p>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 mt-4 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${apt.status === 'completed' ? 'bg-slate-100 text-slate-500' : apt.status === 'in_progress' ? 'bg-primary/10 text-primary' : apt.status === 'arrived' ? 'bg-amber-100 text-amber-600' : apt.status === 'no_show' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                              {apt.status.replace('_', ' ')}
                            </span>
                            
                            {apt.computedState === 'upcoming' && apt.status === 'confirmed' && (
                              <button onClick={() => handleStatusUpdate(apt._id, 'arrived')} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition">Mark Arrived</button>
                            )}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             )}
           </div>
        </div>
      </div>
    </PageShell>
  );
};
"""

content = re.sub(
    r"export const BarberDashboardPage = \(\) => \([\s\S]*?<\/PageShell>\s*\);",
    barber_dashboard_code,
    content
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BarberDashboardPage in UiPages.jsx")
