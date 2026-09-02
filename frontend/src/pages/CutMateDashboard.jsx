import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, MapPin, ShieldCheck, Droplets, Sparkles, Scissors, Wallet, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const DEFAULT_SALON_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
];

const fallbackSalons = [
  {
    _id: 'fallback-1',
    name: 'Lakme Salon Marunji',
    city: 'Pune',
    address: 'Laxmi Chowk, Marunji Village',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'],
    services: [{}, {}],
  },
  {
    _id: 'fallback-2',
    name: 'Style Studio Unisex Salon',
    city: 'Pune',
    address: 'Near Life Republic, Marunji Road',
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
    services: [{}, {}],
  },
  {
    _id: 'fallback-3',
    name: 'The Grooming Room',
    city: 'Pune',
    address: 'Hinjewadi - Marunji Link Road',
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'],
    services: [{}],
  },
];

const CutMateDashboard = () => {
  const [salons, setSalons] = useState([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [salonError, setSalonError] = useState('');
  const [filters, setFilters] = useState({ search: '', location: '', service: '', minRating: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchSalons = async (nextPage = page, nextFilters = filters) => {
    setLoadingSalons(true);
    setSalonError('');
    try {
      const response = await api.get('/salons', {
        params: { ...nextFilters, page: nextPage, limit: 6 },
      });
      const result = response.data || {};
      setSalons(Array.isArray(result.data) ? result.data : []);
      setPage(Number(result.page) || nextPage);
      setPages(Math.max(Number(result.pages) || 1, 1));
    } catch (error) {
      console.warn('Backend unavailable, showing fallback salons.');
      setSalons(fallbackSalons);
      setSalonError('The backend is not reachable, so we are showing sample salons instead.');
    } finally {
      setLoadingSalons(false);
    }
  };

  useEffect(() => {
    fetchSalons(1, filters);
  }, []);

  const handleSalonSearch = (event) => {
    event.preventDefault();
    fetchSalons(1, filters);
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="p-6 md:p-8 bg-[#0a0a0a] min-h-full">
      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-10">
          
          {/* Hero Section */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10">
              <div className="max-w-md">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Fresh Look.</h1>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-amber-500 mb-4">More Confidence.</h1>
                <p className="text-slate-300 text-lg mb-8">
                  Find the best salons & barbers near you<br/>
                  Book in seconds, Shine everyday ✨
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/bookings/new" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition">
                    <Calendar className="w-5 h-5" />
                    Book an Appointment
                  </Link>
                  <Link to="/salons" className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Explore Salons
                  </Link>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 mt-10 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Professionals
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-emerald-500" /> Hygienic & Safe
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Best Price Guarantee
                  </div>
                </div>
              </div>
              <div className="relative mt-8 md:mt-0 flex-shrink-0 hidden sm:block">
                <img src="/assets/hero_model.jpg" alt="Model" className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-4 border-[#0a0a0a] shadow-2xl relative z-10" />
                {/* floating card */}
                <div className="absolute -bottom-6 -left-6 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl z-20">
                  <p className="text-sm font-semibold text-white"></p>
                  <p className="text-sm font-bold text-white mb-2"></p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-300"></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search Widget */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Find the best salon for you</h3>
            <form onSubmit={handleSalonSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 flex flex-col justify-center">
                <label htmlFor="salon-search" className="text-[10px] text-slate-500">Salon name</label>
                <input id="salon-search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search salons" className="mt-1 w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none" />
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 flex flex-col justify-center">
                <label htmlFor="salon-location" className="text-[10px] text-slate-500">Location</label>
                <input id="salon-location" value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} placeholder="City or area" className="mt-1 w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none" />
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 flex flex-col justify-center">
                <label htmlFor="salon-service" className="text-[10px] text-slate-500">Service</label>
                <input id="salon-service" value={filters.service} onChange={(event) => updateFilter('service', event.target.value)} placeholder="Haircut, beard..." className="mt-1 w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none" />
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 flex flex-col justify-center">
                <label htmlFor="salon-rating" className="text-[10px] text-slate-500">Rating</label>
                <select id="salon-rating" value={filters.minRating} onChange={(event) => updateFilter('minRating', event.target.value)} className="mt-1 w-full appearance-none bg-transparent text-sm font-medium text-white focus:outline-none">
                  <option value="" className="bg-[#0a0a0a]">Any rating</option>
                  <option value="3" className="bg-[#0a0a0a]">3+ stars</option>
                  <option value="4" className="bg-[#0a0a0a]">4+ stars</option>
                  <option value="4.5" className="bg-[#0a0a0a]">4.5+ stars</option>
                </select>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition py-3 text-sm">
                Search
              </button>
            </form>
          </section>

          {/* Trending Salons */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Trending Salons Near You</h3>
              <Link to="/salons" className="text-sm font-semibold text-purple-400 hover:text-purple-300">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingSalons ? (
                <div className="col-span-full flex items-center justify-center gap-2 py-12 text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin" />Loading salons...</div>
              ) : salonError ? (
                <div className="col-span-full rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-center text-sm text-red-300">{salonError}</div>
              ) : salons.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><p className="text-sm font-medium text-slate-300">No salons found.</p><p className="mt-1 text-xs text-slate-500">Try another name, location, or service.</p></div>
              ) : (
                salons.map((salon, idx) => {
                  const imageUrl = (salon.images && salon.images[0]) ? salon.images[0] : DEFAULT_SALON_IMAGES[idx % DEFAULT_SALON_IMAGES.length];
                  return (
                    <Link to={`/salons/${salon._id}`} key={salon._id} className="bg-white/5 border border-white/10 rounded-2xl p-3 group hover:border-white/20 transition flex flex-col justify-between">
                      <div>
                        <div className="h-36 bg-slate-800 rounded-xl mb-3 overflow-hidden relative">
                          <img
                            src={imageUrl}
                            alt={salon.name || 'Salon'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DEFAULT_SALON_IMAGES[idx % DEFAULT_SALON_IMAGES.length];
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white text-sm truncate">{salon.name || 'Unnamed salon'}</h4>
                          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-500 flex-shrink-0">
                            <Star className="w-3 h-3 fill-current" /> {salon.rating > 0 ? salon.rating : '4.8'}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-3 truncate">{salon.city || salon.address || 'Location unavailable'}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-white/5 pt-2">
                        <span>{salon.services?.length || 2} services</span>
                        <span className="flex items-center gap-1 text-purple-400 font-semibold"><MapPin className="w-3 h-3"/> View</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
            {pages > 1 && (
              <div className="mt-3 flex items-center justify-end gap-3 text-xs text-slate-400">
                <button type="button" disabled={page <= 1 || loadingSalons} onClick={() => fetchSalons(page - 1)} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40">Previous</button>
                <span>Page {page} of {pages}</span>
                <button type="button" disabled={page >= pages || loadingSalons} onClick={() => fetchSalons(page + 1)} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40">Next</button>
              </div>
            )}
          </section>

          {/* Why Choose CutMate */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-8">Why Choose CutMate?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Star, title: "Top Rated Salons", desc: "Handpicked & Verified" },
                { icon: Calendar, title: "Instant Booking", desc: "Book in just a few taps" },
                { icon: ShieldCheck, title: "Secure Payments", desc: "100% safe & secure" },
                { icon: Droplets, title: "Hygiene First", desc: "Clean & sanitized spaces" }
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-300">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{f.title}</h4>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* Popular Services */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Popular Services</h3>
              <button className="text-sm font-semibold text-purple-400 hover:text-purple-300">View all</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[].map((srv, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/10 transition cursor-pointer">
                  <Scissors className="w-6 h-6 text-amber-500 mb-2" />
                  <span className="text-[10px] font-medium text-white mb-1 leading-tight">{srv.name}</span>
                  <span className="text-[9px] text-slate-500 font-medium">From ₹{srv.p}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Summer Sale Promo */}
          <section className="bg-gradient-to-r from-amber-900/40 to-[#0a0a0a] border border-amber-900/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[180px]">
             <div className="relative z-10 w-2/3">
               <p className="text-amber-500 font-semibold text-[11px] mb-1">Summer Style Sale</p>
               <h3 className="text-2xl font-bold text-white mb-1">Get up to 40% OFF</h3>
               <p className="text-slate-300 text-xs mb-5">on top services</p>
               <Link to="/bookings/new" className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-5 py-2.5 rounded-full font-semibold transition inline-block">
                 Book Now
               </Link>
             </div>
             <img src="/assets/promo_barber.jpg" alt="Promo" className="absolute right-0 top-0 bottom-0 h-full w-1/2 object-cover opacity-80 mix-blend-screen" style={{ maskImage: 'linear-gradient(to right, transparent, black)' }} />
          </section>

          {/* Join as Barber */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
             <div className="relative z-20 w-full sm:w-[60%]">
               <h3 className="text-xl font-bold text-white mb-1">Join as a Barber</h3>
               <p className="text-xs text-slate-400 mb-6">Be your own boss. Earn more. Grow fast.</p>
               
               <div className="space-y-5 mb-6">
                 <div className="flex gap-3">
                   <div className="mt-0.5 bg-purple-900/50 p-1.5 rounded-lg border border-purple-500/30 text-purple-400"><Calendar className="w-3.5 h-3.5"/></div>
                   <div>
                     <h4 className="text-sm font-semibold text-white leading-none mb-1">Flexible Work</h4>
                     <p className="text-[10px] text-slate-500 leading-tight">Choose your time & clients</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="mt-0.5 bg-purple-900/50 p-1.5 rounded-lg border border-purple-500/30 text-purple-400"><Wallet className="w-3.5 h-3.5"/></div>
                   <div>
                     <h4 className="text-sm font-semibold text-white leading-none mb-1">High Earnings</h4>
                     <p className="text-[10px] text-slate-500 leading-tight">Earn more with every booking</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="mt-0.5 bg-purple-900/50 p-1.5 rounded-lg border border-purple-500/30 text-purple-400"><User className="w-3.5 h-3.5"/></div>
                   <div>
                     <h4 className="text-sm font-semibold text-white leading-none mb-1">Grow Your Brand</h4>
                     <p className="text-[10px] text-slate-500 leading-tight">Build your regular customer base</p>
                   </div>
                 </div>
               </div>

               <div className="flex flex-wrap gap-3">
                 <Link to="/jobs" className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-5 py-2.5 rounded-full font-semibold transition inline-flex items-center justify-center">
                   Join as Barber
                 </Link>
                 <Link to="/jobs" className="bg-transparent border border-white/20 hover:bg-white/5 text-white text-xs px-5 py-2.5 rounded-full font-semibold transition inline-flex items-center justify-center">
                   Learn More
                 </Link>
               </div>
             </div>
             
             {/* Barber portrait absolute positioned */}
             <div className="absolute right-0 bottom-0 w-2/5 h-[90%] pointer-events-none hidden sm:block">
                <img src="/assets/barber_portrait.jpg" alt="Barber" className="w-full h-full object-contain object-bottom opacity-90" style={{ maskImage: 'linear-gradient(to top, black 80%, transparent)' }} />
             </div>
             <div className="absolute right-4 bottom-4 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-center z-30 hidden sm:block shadow-xl">
               <p className="text-[10px] text-slate-400 font-medium mb-0.5"></p>
               <div className="flex items-center gap-2">
                 <p className="text-lg font-bold text-white leading-tight"></p>
                 <div className="flex -space-x-1.5">
                   {/*  */}
                 </div>
               </div>
             </div>
          </section>

          {/* How it works */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">How it works?</h3>
            <div className="flex items-start justify-between relative">
              <div className="absolute top-4 left-[10%] right-[10%] h-[1px] bg-white/10 -z-10" />
              {[
                { i: "1", t: "Choose Service", d: "Select the service you need" },
                { i: "2", t: "Pick Salon/Barber", d: "Choose from top professionals" },
                { i: "3", t: "Book Appt", d: "Pick time & confirm booking" },
                { i: "4", t: "Get Style", d: "Sit back & enjoy the magic" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center w-1/4 px-1">
                  <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-amber-500 text-xs font-bold mb-3 shadow-md z-10">
                    {step.i}
                  </div>
                  <h4 className="text-[10px] font-semibold text-white mb-1 leading-tight">{step.t}</h4>
                  <p className="text-[8px] text-slate-500 leading-tight">{step.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* App Banner */}
          <section className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 flex flex-col justify-center border border-purple-500/30 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1">Get the CutMate App</h3>
              <p className="text-xs text-purple-200 mb-5">Book faster, get exclusive deals & manage bookings</p>
              <div className="flex gap-2">
                <button className="bg-black/50 border border-white/20 rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-black/70 transition">
                  <span className="text-[10px] font-medium text-white">Google Play</span>
                </button>
                <button className="bg-black/50 border border-white/20 rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-black/70 transition">
                  <span className="text-[10px] font-medium text-white">App Store</span>
                </button>
              </div>
            </div>
            {/* Optional background phone mockup here */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-2xl rounded-full" />
          </section>

        </div>
      </div>
    </div>
  );
};

export default CutMateDashboard;
