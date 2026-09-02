with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's cleanly rewrite the right column of SalonDetails from scratch.
# We will locate `<div className="space-y-6 lg:sticky lg:top-24">`
# and replace everything until `        </div>\n      </div>\n    </PageShell>`

start_marker = '<div className="space-y-6 lg:sticky lg:top-24">'
end_marker = '        </div>\n      </div>\n    </PageShell>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_right_col = """<div className="space-y-6 lg:sticky lg:top-24">
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
               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <button onClick={() => { setSelectedServiceId(null); setBookingMode(null); setBookingSuccess(null); setBookingError(null); }} className="text-sm font-bold text-primary flex items-center gap-1 mb-4 hover:opacity-80">
                   ← Back to services
                 </button>
                 
                 {(() => {
                   const s = activeServices.find(x => x._id === selectedServiceId);
                   return s ? (
                     <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                       <h4 className="font-bold text-slate-900">{s.name}</h4>
                       <p className="text-sm font-semibold text-primary mt-1">₹{s.price} • {s.duration} min</p>
                     </div>
                   ) : null;
                 })()}

                 {bookingSuccess ? (
                   <div className="pt-4 border-t border-slate-200 mt-6 animate-in slide-in-from-bottom-4">
                     <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                       <h4 className="font-bold text-green-700 flex items-center gap-2">✓ Booking {bookingSuccess.bookingType === 'scheduled' ? 'Scheduled' : 'Confirmed'}</h4>
                       <p className="text-sm text-green-600 mt-1">Your appointment is confirmed for {bookingSuccess.date ? new Date(bookingSuccess.date).toLocaleDateString() : selectedDate} at {bookingSuccess.time || selectedSlot}.</p>
                       <p className="text-xs font-bold text-green-700 mt-2">Booking ID: {bookingSuccess._id.substring(0, 8).toUpperCase()}</p>
                     </div>
                     <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800">
                       View My Bookings
                     </button>
                   </div>
                 ) : !bookingMode ? (
                   <div className="mt-6">
                     {bookingError && (
                       <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold flex flex-col gap-2">
                         <span>{bookingError}</span>
                         {bookingError.includes('log in') && (
                            <button onClick={() => navigate('/login')} className="bg-red-600 text-white py-1.5 px-3 rounded-lg w-fit text-xs">Log In Now</button>
                         )}
                       </div>
                     )}
                     <div className="grid grid-cols-2 gap-3">
                       <button 
                         disabled={isBooking}
                         onClick={async () => {
                           if (!user) return setBookingError('Please log in to continue booking.');
                           setIsBooking(true); setBookingError(null);
                           try {
                             const res = await api.post('/appointments/instant', { shopId: id, serviceId: selectedServiceId });
                             setBookingSuccess(res.data.data);
                           } catch (err) {
                             setBookingError(err.response?.data?.message || 'Error creating instant booking.');
                           } finally {
                             setIsBooking(false);
                           }
                         }}
                         className="py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition"
                       >
                         {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                         Book Now
                       </button>
                       <button 
                         disabled={isBooking}
                         onClick={() => setBookingMode('schedule')}
                         className="py-3.5 bg-white text-slate-900 font-bold border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition"
                       >
                         Schedule
                       </button>
                     </div>
                     <p className="text-xs text-slate-500 mt-4 text-center font-medium">"Book Now" finds the earliest available slot today.</p>
                   </div>
                 ) : (
                   <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <button onClick={() => { setBookingMode(null); setSelectedSlot(null); setBookingError(null); }} className="text-xs font-bold text-slate-500 mb-4 hover:text-slate-700 flex items-center gap-1">← Back to booking options</button>
                     
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Select Date & Time</h3>
                     
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

                     <div className="pt-4 border-t border-slate-200">
                       {bookingError && (
                         <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold flex flex-col gap-2">
                           <span>{bookingError}</span>
                           {bookingError.includes('log in') && (
                              <button onClick={() => navigate('/login')} className="bg-red-600 text-white py-1.5 px-3 rounded-lg w-fit text-xs">Log In Now</button>
                           )}
                         </div>
                       )}
                       <button 
                         disabled={!selectedSlot || isBooking} 
                         onClick={async () => {
                           if (!user) return setBookingError('Please log in to continue booking.');
                           setIsBooking(true); setBookingError(null);
                           try {
                             const res = await api.post('/appointments/scheduled', {
                               shopId: id,
                               serviceId: selectedServiceId,
                               date: selectedDate,
                               startTime: selectedSlot
                             });
                             setBookingSuccess(res.data.data);
                           } catch (err) {
                             setBookingError(err.response?.data?.message || 'We couldn\\'t schedule your appointment. Please try again.');
                           } finally {
                             setIsBooking(false);
                           }
                         }}
                         className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition ${selectedSlot && !isBooking ? 'bg-primary text-white shadow-md hover:opacity-90' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                       >
                         {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-4 h-4" />}
                         {isBooking ? 'Scheduling...' : 'Confirm Schedule'}
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             )}
           </div>
\n"""

content = content[:start_idx] + new_right_col + content[end_idx:]

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced right column perfectly.")
