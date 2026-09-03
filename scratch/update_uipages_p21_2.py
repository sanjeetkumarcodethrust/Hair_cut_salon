import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

live_queue_state = """
export const CustomerDashboardPage = () => {
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [appointments, setAppointments] = React.useState([]);
  const [liveQueueEntry, setLiveQueueEntry] = React.useState(null);
  const [queueStatus, setQueueStatus] = React.useState(null);
"""
content = content.replace("export const CustomerDashboardPage = () => {\n  const [activeTab, setActiveTab] = React.useState('upcoming');\n  const [appointments, setAppointments] = React.useState([]);", live_queue_state)

live_queue_fetch = """
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/customer');
        setAppointments(res.data.data);
        
        // Find arrived (queue) booking
        const inQueue = res.data.data.find(a => a.status === 'arrived');
        setLiveQueueEntry(inQueue);
        if (inQueue) {
           const qRes = await api.get(`/queue/position/${inQueue._id}`);
           setQueueStatus(qRes.data);
        }
      } catch(err) {
        toast.error('Failed to load appointments');
      }
    };
"""
content = re.sub(
    r"const fetchAppointments = async \(\) => \{[\s\S]*?catch\(err\) \{[\s\S]*?toast\.error\('Failed to load appointments'\);[\s\S]*?\}[\s\S]*?\};",
    live_queue_fetch,
    content
)

leave_queue_fn = """
  const handleLeaveQueue = async (id) => {
    try {
      await api.delete(`/queue/leave/${id}`);
      toast.success('Left queue successfully');
      setLiveQueueEntry(null);
      setQueueStatus(null);
    } catch(e) {
      toast.error('Failed to leave queue');
    }
  };
"""
content = content.replace("const handleCancel = async (id) => {", leave_queue_fn + "\n  const handleCancel = async (id) => {")

live_queue_ui = """
      {/* Live Queue Banner */}
      {liveQueueEntry && queueStatus && (
        <div className="mb-8 bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
             <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
             Live Queue Status
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-sm text-slate-400 font-bold uppercase mb-1">Position</p>
                <p className="text-3xl font-black text-white">#{queueStatus.position}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-sm text-slate-400 font-bold uppercase mb-1">Est. Wait</p>
                <p className="text-3xl font-black text-primary">~{queueStatus.estimatedWaitMin}m</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 col-span-2 flex flex-col justify-center">
                <p className="text-sm text-slate-400 font-bold uppercase mb-1">Shop</p>
                <p className="font-bold text-white truncate">{liveQueueEntry.salon?.name}</p>
                <p className="text-sm text-slate-400 truncate">{liveQueueEntry.services?.map(s => s.name).join(' + ') || liveQueueEntry.service?.name}</p>
              </div>
           </div>
           <div className="flex justify-end relative z-10">
              <button onClick={() => handleLeaveQueue(liveQueueEntry._id)} className="px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition text-sm">
                Leave Queue
              </button>
           </div>
        </div>
      )}
"""

content = content.replace("<div className=\"flex flex-wrap gap-2 mb-8\">", live_queue_ui + "\n      <div className=\"flex flex-wrap gap-2 mb-8\">")


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CustomerDashboardPage for Phase 21")
