import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

salon_details_code = """export const SalonDetails = () => {
  const { id } = useParams();
  const { selectedLocation } = useSelector(state => state.location || {});
  
  const [salon, setSalon] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const [searchService, setSearchService] = React.useState('');
  const [selectedServiceId, setSelectedServiceId] = React.useState(null);
  
  // Phase 5: Availability State
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState(null);

  React.useEffect(() => {
    const fetchSalon = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedLocation?.latitude) {
           params.latitude = selectedLocation.latitude;
           params.longitude = selectedLocation.longitude;
        }
        const res = await api.get(`/salons/${id}`, { params });
        setSalon(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Shop not found');
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, [id, selectedLocation?.latitude, selectedLocation?.longitude]);

  // Fetch slots when service or date changes
  React.useEffect(() => {
    if (!selectedServiceId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await api.get(`/salons/${id}/availability`, {
          params: { date: selectedDate, serviceId: selectedServiceId }
        });
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [id, selectedServiceId, selectedDate]);

  if (loading) return (
    <PageShell eyebrow="Loading..." title="Loading Shop Profile...">
      <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </PageShell>
  );
  
  if (error || !salon) return (
    <PageShell eyebrow="Error" title="Shop Not Found">
      <div className="p-12 bg-slate-50 rounded-3xl text-center border border-slate-200 mt-6">
        <p className="text-slate-900 font-bold text-lg mb-2">{error || "This barber shop does not exist or has been removed."}</p>
        <Link to="/salons" className="inline-block mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:opacity-90">← Back to nearby barbers</Link>
      </div>
    </PageShell>
  );

  const activeServices = salon.services?.filter(s => s.isActive !== false) || [];
  const filteredServices = activeServices.filter(s => s.name.toLowerCase().includes(searchService.toLowerCase()));
  
  const categorized = {};
  filteredServices.forEach(s => {
    const cat = s.category || 'Other';
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(s);
  });

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayStr = days[new Date().getDay()];
  const todayHours = salon.openingHours?.[todayStr];
  const isOpenToday = todayHours && !todayHours.isClosed;

  // Generate next 7 days for Date Picker
  const dateOptions = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      display: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  return (
    <PageShell
      eyebrow={<Link to="/salons" className="text-primary hover:text-indigo-700 flex items-center gap-1 font-semibold text-sm transition"><Navigation className="w-4 h-4 rotate-[-90deg]" /> Back to Nearby Barbers</Link>}
      title={salon.name}
      description={salon.description}
    >
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] mt-6 items-start">
        {/* Left Column: Shop Info & Details */}
        <div className="space-y-8">
          
          {/* Cover & Gallery */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm shadow-slate-200/50">
            <div className="h-64 bg-slate-100 relative">
              {salon.images?.length > 0 ? (
                 <img src={salon.images[0]} alt={salon.name} className="w-full h-full object-cover" />
              ) : (
                 <div className="flex h-full items-center justify-center text-slate-400 font-bold">No Cover Image</div>
              )}
              {salon.activeOffer?.isActive && (
                <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 text-sm">
                  <Tag className="w-4 h-4" /> {salon.activeOffer.title}
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                 <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-xl font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-500" /> {salon.rating > 0 ? salon.rating : 'New'}
                    </span>
                    <span className="text-slate-500 font-medium text-sm">({salon.totalReviews} reviews)</span>
                 </div>
                 {isOpenToday ? (
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-xl font-bold text-sm">Open Today</span>
                 ) : (
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-xl font-bold text-sm">Closed Today</span>
                 )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{salon.name}</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3">
                   <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-semibold text-slate-900 mb-1">Location</p>
                     <p className="text-sm text-slate-600 leading-relaxed">{salon.address}, {salon.city}</p>
                     {salon.distanceMeters && (
                       <p className="text-xs font-bold text-primary mt-2">{(salon.distanceMeters/1000).toFixed(1)} km from your location</p>
                     )}
                   </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3">
                   <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-semibold text-slate-900 mb-1">Today's Hours</p>
                     {isOpenToday ? (
                        <p className="text-sm text-slate-600 leading-relaxed">{todayHours.open} - {todayHours.close}</p>
                     ) : (
                        <p className="text-sm text-slate-600 leading-relaxed">Closed</p>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> About Shop</h3>
            <p className="text-slate-600 text-sm leading-loose">{salon.description}</p>
            {salon.phone && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><Phone className="w-4 h-4 text-slate-600" /></div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</p>
                   <p className="text-sm font-semibold text-slate-900">{salon.phone}</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Services Menu & Availability */}
        <div className="space-y-6 lg:sticky lg:top-24">
           <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
             {!selectedServiceId ? (
               <>
                 <div className="mb-6">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Service Menu</h3>
                   <p className="text-sm text-slate-500 font-medium">Select a service to check availability.</p>
                 </div>

                 <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                 </div>

                 <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                   {Object.keys(categorized).length === 0 ? (
                     <p className="text-center text-slate-500 text-sm py-4">No services match your search.</p>
                   ) : (
                     Object.entries(categorized).map(([category, services]) => (
                       <div key={category}>
                         <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">{category}</h4>
                         <div className="space-y-3">
                           {services.map(service => (
                               <div 
                                 key={service._id} 
                                 onClick={() => setSelectedServiceId(service._id)}
                                 className="p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 bg-white transition cursor-pointer flex flex-col justify-between group"
                               >
                                  <div className="flex justify-between items-start mb-2 gap-4">
                                    <div>
                                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-primary transition">{service.name}</h5>
                                      {service.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="font-bold text-sm text-slate-900">₹{service.price}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/60">
                                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {service.duration} min</span>
                                    <span className="text-xs font-bold px-4 py-1.5 rounded-lg transition bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-primary">
                                      Select
                                    </span>
                                  </div>
                               </div>
                           ))}
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               </>
             ) : (
               // Availability View
               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <button onClick={() => setSelectedServiceId(null)} className="text-sm font-bold text-primary flex items-center gap-1 mb-4 hover:opacity-80">
                   ← Back to services
                 </button>
                 
                 {/* Selected Service Snippet */}
                 {(() => {
                   const s = activeServices.find(x => x._id === selectedServiceId);
                   return s ? (
                     <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                       <h4 className="font-bold text-slate-900">{s.name}</h4>
                       <p className="text-sm font-semibold text-primary mt-1">₹{s.price} • {s.duration} min</p>
                     </div>
                   ) : null;
                 })()}

                 <h3 className="text-lg font-bold text-slate-900 mb-4">Select Date & Time</h3>
                 
                 {/* Date Selector */}
                 <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-2 -mx-2 px-2">
                   {dateOptions.map(opt => (
                     <button
                       key={opt.dateString}
                       onClick={() => setSelectedDate(opt.dateString)}
                       className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition whitespace-nowrap ${selectedDate === opt.dateString ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                     >
                       {opt.display}
                     </button>
                   ))}
                 </div>

                 {/* Time Slots */}
                 <div className="mb-6">
                   {loadingSlots ? (
                     <div className="flex justify-center items-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                   ) : availableSlots.length === 0 ? (
                     <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-sm font-bold text-slate-500 mb-1">No availability on this day</p>
                       <p className="text-xs text-slate-400">Please select a different date.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {availableSlots.map(slot => (
                         <button
                           key={slot.startTime}
                           onClick={() => setSelectedSlot(slot.startTime)}
                           className={`py-2.5 rounded-xl text-sm font-bold border transition ${selectedSlot === slot.startTime ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                         >
                           {slot.startTime}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>

                 {/* Sticky Action Footer */}
                 <div className="pt-4 border-t border-slate-200">
                   <button 
                     disabled={!selectedSlot} 
                     className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition ${selectedSlot ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                   >
                     <Calendar className="w-4 h-4" /> Continue to Booking
                   </button>
                   {selectedSlot && <p className="text-[10px] font-bold text-center text-amber-500 mt-2 uppercase tracking-wide">Booking opens in Phase 6</p>}
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </PageShell>
  );
};"""

start_idx = content.find('export const SalonDetails = () => {')
end_idx = content.find('export const BarberProfile = () => (')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + salon_details_code + '\n\n\n' + content[end_idx:]
    with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated SalonDetails component with Availability UI")
else:
    print("Could not find SalonDetails component")
