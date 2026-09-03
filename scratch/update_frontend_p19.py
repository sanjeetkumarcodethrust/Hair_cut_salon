import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SalonDetails to use selectedServiceIds
content = content.replace("const [selectedServiceId, setSelectedServiceId] = React.useState(null);", "const [selectedServiceIds, setSelectedServiceIds] = React.useState([]);")
content = content.replace("setSelectedServiceId(s._id);", "setSelectedServiceIds([s._id]);")

service_selection_logic = """
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-900">{s.name}</h4>
                      <p className="font-bold text-primary">₹{s.price}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-slate-500 font-medium">{s.duration} min</p>
                      <button
                        onClick={() => {
                          if (selectedServiceIds.includes(s._id)) {
                             setSelectedServiceIds(prev => prev.filter(id => id !== s._id));
                          } else {
                             setSelectedServiceIds(prev => [...prev, s._id]);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl font-bold transition ${selectedServiceIds.includes(s._id) ? 'bg-primary text-white' : 'bg-slate-100 text-primary hover:bg-slate-200'}`}
                      >
                        {selectedServiceIds.includes(s._id) ? 'Selected' : 'Add'}
                      </button>
                    </div>
"""

# The existing block for rendering services in SalonDetails is likely similar. Let's do a smart regex.
content = re.sub(
    r"<div className=\"flex justify-between items-center mb-2\">[\s\S]*?<button\s+onClick=\{[^}]*\}\s+className=\"px-4 py-2 bg-slate-100 text-primary font-bold rounded-xl hover:bg-slate-200 transition\">\s*Book Now\s*</button>\s*</div>",
    service_selection_logic,
    content
)

# Render sticky checkout bar in SalonDetails
sticky_bar = """
      {/* Sticky Cart / Checkout Bar for Phase 19 */}
      {selectedServiceIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between md:justify-center md:gap-20">
           <div>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{selectedServiceIds.length} Service{selectedServiceIds.length > 1 ? 's' : ''} Selected</p>
             <p className="text-xl font-black text-slate-900">₹{salon.services.filter(s => selectedServiceIds.includes(s._id)).reduce((acc, curr) => acc + curr.price, 0)}</p>
           </div>
           <button onClick={() => navigate('/book', { state: { salon, selectedServiceIds } })} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg">
              Book Now
           </button>
        </div>
      )}
"""
content = content.replace("</PageShell>", sticky_bar + "\n    </PageShell>")


# 2. Update BookingPage to read selectedServiceIds
content = content.replace("const { salon, selectedServiceId } = location.state || {};", "const { salon, selectedServiceIds } = location.state || {};")
content = content.replace("const service = salon?.services?.find(s => s._id === selectedServiceId);", """
  const selectedServices = salon?.services?.filter(s => selectedServiceIds?.includes(s._id)) || [];
  const service = selectedServices.length > 0 ? {
     _id: selectedServices[0]._id,
     name: selectedServices.map(s => s.name).join(' + '),
     price: selectedServices.reduce((a, b) => a + b.price, 0),
     duration: selectedServices.reduce((a, b) => a + (b.duration || 30), 0)
  } : null;
""")

content = content.replace("serviceId: selectedServiceId,", "serviceIds: selectedServiceIds,")


# 3. Update CustomerDashboardPage Book Again
book_again_fn_new = """
  const handleBookAgain = (booking) => {
    let sIds = [];
    if (booking.services && booking.services.length > 0) {
      sIds = booking.services.map(s => s.serviceId || s._id);
    } else if (booking.serviceId) {
      sIds = [booking.serviceId];
    }
    navigate(`/salons/${booking.salon?._id}`, { state: { selectedServiceIds: sIds } });
  };
"""
content = re.sub(
    r"const handleBookAgain = \(booking\) => \{[\s\S]*?navigate\(`/salons/\$\{booking\.salon\?._id\}`\);\s*\};",
    book_again_fn_new,
    content
)

# Make sure SalonDetails reads selectedServiceIds from state if present
content = content.replace("const [selectedServiceIds, setSelectedServiceIds] = React.useState([]);", """
  const location = window.location;
  const initialState = window.history.state?.usr?.selectedServiceIds || [];
  const [selectedServiceIds, setSelectedServiceIds] = React.useState(initialState);
""")


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated frontend for Phase 19 Multi-Service")
