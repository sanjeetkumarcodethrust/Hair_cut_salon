import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add attendance and leave state to BarberDashboardPage
barber_state = """
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  // Phase 22 States
  const [attendance, setAttendance] = React.useState(null);
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [leaveData, setLeaveData] = React.useState({ leaveType: 'Personal', startDate: '', endDate: '', reason: '' });
"""
content = content.replace("const [data, setData] = React.useState(null);\n  const [error, setError] = React.useState(null);", barber_state)

# Fetch attendance
barber_fetch = """
    try {
      setLoading(true);
      const res = await api.get('/staff/dashboard');
      setData(res.data);
      
      const attRes = await api.get('/workforce/attendance/today');
      setAttendance(attRes.data.attendance);
    } catch (err) {
"""
content = content.replace("try {\n      setLoading(true);\n      const res = await api.get('/staff/dashboard');\n      setData(res.data);\n    } catch (err) {", barber_fetch)

# Attendance functions
barber_funcs = """
  const handleCheckIn = async () => {
     try {
        const res = await api.post('/workforce/check-in');
        setAttendance(res.data.attendance);
        toast.success('Checked in successfully!');
     } catch (e) { toast.error(e.response?.data?.message || 'Error checking in'); }
  };
  const handleCheckOut = async () => {
     try {
        const res = await api.post('/workforce/check-out');
        setAttendance(res.data.attendance);
        toast.success('Checked out successfully!');
     } catch (e) { toast.error(e.response?.data?.message || 'Error checking out'); }
  };
  const handleRequestLeave = async (e) => {
     e.preventDefault();
     try {
        await api.post('/workforce/leave', leaveData);
        toast.success('Leave requested successfully!');
        setShowLeaveModal(false);
     } catch (e) { toast.error(e.response?.data?.message || 'Error requesting leave'); }
  };
"""
content = content.replace("const handleStatusUpdate = async (id, newStatus) => {", barber_funcs + "\n  const handleStatusUpdate = async (id, newStatus) => {")

# Add Attendance UI right before "Now Serving"
attendance_ui = """
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Now Serving */}
        <div className="lg:col-span-1 space-y-6">
        
          {/* Phase 22 Attendance Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">Today's Attendance</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${attendance ? (attendance.checkOut ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-600') : 'bg-red-100 text-red-600'}`}>
                   {attendance ? (attendance.checkOut ? 'Clocked Out' : 'Clocked In') : 'Not Checked In'}
                </span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {!attendance ? (
                   <button onClick={handleCheckIn} className="col-span-2 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">Check In</button>
                ) : !attendance.checkOut ? (
                   <button onClick={handleCheckOut} className="col-span-2 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition">Check Out</button>
                ) : (
                   <div className="col-span-2 py-2 bg-slate-100 text-slate-500 text-center font-bold rounded-xl">Shift Completed</div>
                )}
                <button onClick={() => setShowLeaveModal(true)} className="col-span-2 py-2 mt-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Request Leave</button>
             </div>
          </div>
          
          {/* Leave Modal */}
          {showLeaveModal && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 w-full max-w-md">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xl">Request Leave</h3>
                      <button onClick={() => setShowLeaveModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                   </div>
                   <form onSubmit={handleRequestLeave} className="space-y-4">
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Leave Type</label>
                         <select value={leaveData.leaveType} onChange={e => setLeaveData({...leaveData, leaveType: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200">
                            <option>Personal</option><option>Sick</option><option>Vacation</option>
                         </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                            <input type="date" required value={leaveData.startDate} onChange={e => setLeaveData({...leaveData, startDate: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                            <input type="date" required value={leaveData.endDate} onChange={e => setLeaveData({...leaveData, endDate: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" />
                         </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl">Submit Request</button>
                   </form>
                </div>
             </div>
          )}

          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
"""
content = content.replace("      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">\n        {/* Left Column: Now Serving */}\n        <div className=\"lg:col-span-1 space-y-6\">\n          <h2 className=\"text-xl font-bold text-slate-900 flex items-center gap-2\">", attendance_ui)


# 2. Add Leave Approval to OwnerDashboardPage
owner_state = """
export const OwnerDashboardPage = () => {
  const { user } = useSelector(state => state.auth || {});
  const [salon, setSalon] = React.useState(null);
  
  // Phase 22 States
  const [leaveRequests, setLeaveRequests] = React.useState([]);
  
  React.useEffect(() => {
     api.get('/salons').then(res => {
         const mySalon = res.data.data.find(s => s.owner?._id === user?._id || s.owner === user?._id);
         if (mySalon) {
             setSalon(mySalon);
             api.get(`/workforce/leave/shop/${mySalon._id}`).then(lr => setLeaveRequests(lr.data.leaves)).catch(console.error);
         }
     }).catch(console.error);
  }, [user]);

  const handleLeaveResponse = async (id, status) => {
      try {
          await api.patch(`/workforce/leave/${id}/respond`, { status });
          setLeaveRequests(prev => prev.map(l => l._id === id ? { ...l, status } : l));
          toast.success(`Leave ${status}`);
      } catch (err) {
          toast.error('Failed to update leave');
      }
  };
"""

content = re.sub(
    r"export const OwnerDashboardPage = \(\) => \{[\s\S]*?\}, \[user\]\);",
    owner_state,
    content
)

owner_ui = """
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-8">
        {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
            <p className="mt-2 text-sm text-slate-600">This workspace is ready for owner-specific management views.</p>
          </div>
        ))}
      </div>
      
      {/* Phase 22 Leave Management */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
         <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Leave Requests</h2>
         {leaveRequests.filter(l => l.status === 'PENDING').length === 0 ? (
             <p className="text-slate-500">No pending leave requests.</p>
         ) : (
             <div className="space-y-4">
                {leaveRequests.filter(l => l.status === 'PENDING').map(leave => (
                   <div key={leave._id} className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50 rounded-xl">
                      <div>
                         <p className="font-bold text-slate-900">{leave.staffId?.name}</p>
                         <p className="text-sm text-slate-500">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} • {leave.leaveType}</p>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => handleLeaveResponse(leave._id, 'APPROVED')} className="px-3 py-1.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 text-sm">Approve</button>
                         <button onClick={() => handleLeaveResponse(leave._id, 'REJECTED')} className="px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 text-sm">Reject</button>
                      </div>
                   </div>
                ))}
             </div>
         )}
      </div>
    </PageShell>
"""

content = content.replace(
    "      <div className=\"grid gap-4 md:grid-cols-2 xl:grid-cols-3\">\n        {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (\n          <div key={item} className=\"rounded-2xl border border-slate-200 bg-white p-6 shadow-sm\">\n            <h3 className=\"text-lg font-semibold text-slate-900\">{item}</h3>\n            <p className=\"mt-2 text-sm text-slate-600\">This workspace is ready for owner-specific management views.</p>\n          </div>\n        ))}\n      </div>\n    </PageShell>",
    owner_ui
)


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Barber and Owner Dashboards for Phase 22")
