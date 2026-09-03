import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SalonDetails to fetch live queue and show buttons
live_queue_state = """
  const [salon, setSalon] = React.useState(null);
  const [liveQueue, setLiveQueue] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
"""

content = content.replace("const [salon, setSalon] = React.useState(null);\n  const [loading, setLoading] = React.useState(true);", live_queue_state)

live_queue_fetch = """
        const res = await api.get(`/salons/${id}`, { params });
        setSalon(res.data.data);
        try {
           const qRes = await api.get(`/queue/shop/${id}`);
           setLiveQueue(qRes.data);
        } catch (e) {
           console.log("No queue data available");
        }
"""

content = content.replace("const res = await api.get(`/salons/${id}`, { params });\n        setSalon(res.data.data);", live_queue_fetch)


live_banner = """
        <img src={salon.bannerImage || '/api/placeholder/800/400'} alt="Shop" className="w-full h-full object-cover" />
      </div>
      
      {/* Live Queue Banner Phase 21 */}
      {liveQueue && (
         <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
               <div className="flex gap-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${liveQueue.walkInsEnabled && !liveQueue.isFull ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
               </div>
               <span className="font-bold">{liveQueue.walkInsEnabled && !liveQueue.isFull ? 'WALK-INS OPEN' : 'WALK-INS PAUSED/FULL'}</span>
            </div>
            <div className="flex gap-4 font-medium text-slate-300">
               <span>{liveQueue.waitingCount} waiting</span>
               <span>~{liveQueue.estimatedWaitMin}m wait</span>
            </div>
         </div>
      )}
"""
content = re.sub(
    r"<img src=\{salon\.bannerImage \|\| '\/api\/placeholder\/800\/400'\} alt=\"Shop\" className=\"w-full h-full object-cover\" \/>\s*<\/div>",
    live_banner,
    content
)


handle_join_queue = """
  const handleJoinQueue = async () => {
    try {
       await api.post('/queue/join', { shopId: id, serviceIds: selectedServiceIds });
       toast.success('Successfully joined walk-in queue!');
       navigate('/dashboard');
    } catch(err) {
       toast.error(err.response?.data?.message || 'Failed to join queue');
    }
  };
"""
content = content.replace("const [searchService, setSearchService] = React.useState('');", handle_join_queue + "\n  const [searchService, setSearchService] = React.useState('');")


sticky_footer = """
      {/* Sticky Cart / Checkout Bar for Phase 19 & 21 */}
      {selectedServiceIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between md:justify-center md:gap-8 lg:gap-20">
           <div>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{selectedServiceIds.length} Service{selectedServiceIds.length > 1 ? 's' : ''} Selected</p>
             <p className="text-xl font-black text-slate-900">₹{salon.services.filter(s => selectedServiceIds.includes(s._id)).reduce((acc, curr) => acc + curr.price, 0)}</p>
           </div>
           <div className="flex gap-2">
             {liveQueue?.walkInsEnabled && !liveQueue?.isFull && (
               <button onClick={handleJoinQueue} className="px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg text-sm md:text-base">
                  Join Walk-in Queue
               </button>
             )}
             <button onClick={() => navigate('/book', { state: { salon, selectedServiceIds } })} className="px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg text-sm md:text-base">
                Book Appointment
             </button>
           </div>
        </div>
      )}
"""

content = re.sub(
    r"\{\/\* Sticky Cart \/ Checkout Bar for Phase 19 \*\/\}[\s\S]*?<\/div>\s*\)\}",
    sticky_footer,
    content
)


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated SalonDetails for Phase 21")
