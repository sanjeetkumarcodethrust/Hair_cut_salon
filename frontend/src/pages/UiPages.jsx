import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setLocation } from '../features/location/locationSlice.js';
import { LocationService } from '../services/LocationService.js';
import { MapPin, Search, Navigation, X, SlidersHorizontal, Tag, Star, Clock, Phone, Calendar, Info } from 'lucide-react';
import toast from 'react-hot-toast';

import { Loader2 } from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../services/api';
import { SkeletonCard, ErrorState } from '../components/UIStates';
const panelClasses = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70';

const quickLinks = [];

const metrics = [];

export const LandingPage = () => (
  <PageShell
    eyebrow="Salon booking platform"
    title="Book salons, barbers, and jobs from one modern experience"
    description="The new UI flow gives customers a fast booking experience while helping salons and barbers manage appointments and opportunities in one place."
    actions={quickLinks.map((link) => (
      <Link key={link.title} to={link.href} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        {link.title}
      </Link>
    ))}
  >
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className={panelClasses}>
        <h2 className="text-xl font-semibold text-slate-900">Welcome to your salon marketplace</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Customers can browse services, book appointments, and track favorites. Salon owners can review bookings and post new jobs. Barbers can update their profile and manage requests.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 space-y-3">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.href} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <span>{link.title}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  
      



    </PageShell>
);

const fallbackSalons = [
  {
    _id: 'fallback-1',
    name: 'Lakme Salon Marunji',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Laxmi Chowk, Marunji Village',
    rating: 4.8,
    services: [],
  },
  {
    _id: 'fallback-2',
    name: 'Style Studio Unisex Salon',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Near Life Republic, Marunji Road',
    rating: 4.6,
    services: [],
  },
  {
    _id: 'fallback-3',
    name: 'The Grooming Room',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Hinjewadi - Marunji Link Road',
    rating: 4.7,
    services: [],
  },
];

export const SearchSalons = () => {
  const dispatch = useDispatch();
  const { selectedLocation } = useSelector(state => state.location || {});
  
  const [salons, setSalons] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);
  
  // Location Picker State
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const [locationQuery, setLocationQuery] = React.useState('');
  const [locationResults, setLocationResults] = React.useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = React.useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [sortParam, setSortParam] = React.useState('relevance');

  // Filter Drawer State
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState({
    radius: 5000,
    minPrice: '',
    maxPrice: '',
    minRating: '',
    offersOnly: false
  });
  
  // Temp state for while the drawer is open
  const [tempFilters, setTempFilters] = React.useState(activeFilters);

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400); 
    return () => clearTimeout(handler);
  }, [searchQuery]);

  React.useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      fetchNearbySalons(1, true); 
    } else {
      setShowLocationPicker(true);
      setSalons([]);
    }
  }, [selectedLocation?.latitude, selectedLocation?.longitude, debouncedSearch, sortParam, activeFilters]);

  const fetchNearbySalons = async (pageNum = 1, isReset = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/salons/nearby', {
        params: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          page: pageNum,
          limit: 12,
          search: debouncedSearch,
          sort: sortParam,
          radius: activeFilters.radius,
          minPrice: activeFilters.minPrice || undefined,
          maxPrice: activeFilters.maxPrice || undefined,
          minRating: activeFilters.minRating || undefined,
          offersOnly: activeFilters.offersOnly || undefined
        }
      });
      if (pageNum === 1 || isReset) {
        setSalons(response.data.data || []);
      } else {
        setSalons(prev => [...prev, ...(response.data.data || [])]);
      }
      setHasMore(response.data.hasMore);
      setTotalCount(response.data.total);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setError("We couldn't load nearby barber shops. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setIsSearchingLocation(true);
      const coords = await LocationService.getCurrentLocation();
      const displayName = await LocationService.reverseGeocode(coords.latitude, coords.longitude);
      dispatch(setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        displayName,
        source: 'current'
      }));
      setShowLocationPicker(false);
    } catch (err) {
      toast.error('Unable to detect your location. Try manual location search.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setIsSearchingLocation(true);
    const results = await LocationService.searchLocation(locationQuery);
    setLocationResults(results);
    setIsSearchingLocation(false);
  };

  const handleSelectLocation = (loc) => {
    dispatch(setLocation({ ...loc, source: 'manual' }));
    setShowLocationPicker(false);
    setLocationResults([]);
    setLocationQuery('');
  };

  const openFilters = () => {
    setTempFilters(activeFilters);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setActiveFilters(tempFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const defaultFilters = { radius: 5000, minPrice: '', maxPrice: '', minRating: '', offersOnly: false };
    setTempFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setShowFilters(false);
  };

  const removeFilter = (key) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: key === 'radius' ? 5000 : (key === 'offersOnly' ? false : '')
    }));
  };

  const activeFilterCount = Object.entries(activeFilters).filter(([k, v]) => {
    if (k === 'radius' && v !== 5000) return true;
    if (k === 'offersOnly' && v === true) return true;
    if (k !== 'radius' && k !== 'offersOnly' && v !== '') return true;
    return false;
  }).length;

  return (
    <PageShell
      eyebrow="Nearby Discovery"
      title="Find Barber Shops Near You"
      description="Discover the most relevant salons and barbers in your area."
    >
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Selected Location</p>
          <div className="flex items-center gap-2 text-slate-900 font-medium">
            <MapPin className="w-5 h-5 text-primary" />
            {selectedLocation?.displayName || 'No location selected'}
          </div>
        </div>
        <button
          onClick={() => setShowLocationPicker(true)}
          className="text-sm font-semibold text-primary hover:text-indigo-700 transition px-4 py-2 bg-indigo-50 rounded-xl"
        >
          Change Location
        </button>
      </div>

      {showLocationPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            {selectedLocation?.latitude && (
              <button 
                onClick={() => setShowLocationPicker(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >✕</button>
            )}
            <h3 className="text-lg font-bold text-slate-900 mb-4">Set your location</h3>
            <button
              onClick={handleCurrentLocation}
              disabled={isSearchingLocation}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-70"
            >
              {isSearchingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
              Use My Current Location
            </button>
            <div className="relative flex items-center py-2 mb-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">or search manually</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <form onSubmit={handleSearchLocation} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter area, city or locality..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {locationResults.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-200 flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">{loc.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedLocation?.latitude && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search barber, salon or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="w-full md:w-auto shrink-0 flex items-center gap-3">
              <button onClick={openFilters} className="relative flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none hover:bg-slate-50 shadow-sm w-full md:w-auto justify-center">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                   <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              <select
                value={sortParam}
                onChange={(e) => setSortParam(e.target.value)}
                className="w-full md:w-auto py-3.5 pl-4 pr-8 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="relevance">Recommended</option>
                <option value="distance">Nearest</option>
                <option value="rating">Highest Rated</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500 mr-1">Active:</span>
              {activeFilters.radius !== 5000 && (
                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-primary border border-indigo-100 rounded-full text-xs font-semibold">
                   Within {activeFilters.radius === 'any' ? 'Any' : activeFilters.radius/1000} km
                   <button onClick={() => removeFilter('radius')} className="hover:bg-indigo-100 p-0.5 rounded-full"><X className="w-3 h-3"/></button>
                 </span>
              )}
              {(activeFilters.minPrice || activeFilters.maxPrice) && (
                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-primary border border-indigo-100 rounded-full text-xs font-semibold">
                   ₹{activeFilters.minPrice || '0'} - ₹{activeFilters.maxPrice || 'Any'}
                   <button onClick={() => {removeFilter('minPrice'); removeFilter('maxPrice')}} className="hover:bg-indigo-100 p-0.5 rounded-full"><X className="w-3 h-3"/></button>
                 </span>
              )}
              {activeFilters.minRating && (
                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-semibold">
                   {activeFilters.minRating}+ Stars
                   <button onClick={() => removeFilter('minRating')} className="hover:bg-amber-100 p-0.5 rounded-full"><X className="w-3 h-3"/></button>
                 </span>
              )}
              {activeFilters.offersOnly && (
                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-xs font-semibold">
                   Offers only
                   <button onClick={() => removeFilter('offersOnly')} className="hover:bg-green-100 p-0.5 rounded-full"><X className="w-3 h-3"/></button>
                 </span>
              )}
              <button onClick={clearFilters} className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline ml-2">Clear all</button>
            </div>
          )}
        </div>
      )}

      {showFilters && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowFilters(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">✕</button>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Filters</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Distance</label>
                <div className="flex flex-wrap gap-2">
                  {[{label:'1 km', v:1000}, {label:'3 km', v:3000}, {label:'5 km', v:5000}, {label:'10 km', v:10000}, {label:'Any', v:'any'}].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setTempFilters({...tempFilters, radius: opt.v})}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${tempFilters.radius === opt.v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Price Range (₹)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={tempFilters.minPrice}
                    onChange={(e) => setTempFilters({...tempFilters, minPrice: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-slate-400 font-medium">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={tempFilters.maxPrice}
                    onChange={(e) => setTempFilters({...tempFilters, maxPrice: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Rating</label>
                <div className="flex flex-wrap gap-2">
                  {[{label:'Any', v:''}, {label:'3.0+', v:'3'}, {label:'3.5+', v:'3.5'}, {label:'4.0+', v:'4'}, {label:'4.5+', v:'4.5'}].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setTempFilters({...tempFilters, minRating: opt.v})}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition flex items-center gap-1 ${tempFilters.minRating === opt.v ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                      {opt.v && <Star className="w-3.5 h-3.5" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={tempFilters.offersOnly}
                    onChange={(e) => setTempFilters({...tempFilters, offersOnly: e.target.checked})}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5"><Tag className="w-4 h-4 text-green-500" /> Offers Available</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Show only shops with active offers</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={clearFilters} className="w-full py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Clear All</button>
              <button onClick={applyFilters} className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:opacity-90 transition shadow-sm">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {!selectedLocation?.latitude ? null : loading && page === 1 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchNearbySalons(1)} />
      ) : salons.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-12 text-center border border-slate-200/60 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200/50 text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-slate-900 text-lg font-bold mb-2">No barber shops match your filters.</p>
          <p className="text-slate-500 text-sm mb-6">Try adjusting distance, price, or search terms.</p>
          <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {debouncedSearch ? `Search Results` : `Recommended Barber Shops`}
            </h2>
            <span className="text-sm font-semibold text-slate-500">{totalCount} {totalCount === 1 ? 'result' : 'results'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <div key={salon._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="h-48 bg-slate-100 relative">
                    {salon.images?.[0] ? (
                       <img src={salon.images[0]} alt={salon.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="flex h-full items-center justify-center text-slate-300 font-medium text-sm">No Image Available</div>
                    )}
                    {salon.activeOffer?.isActive && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {salon.activeOffer.title || 'Offer available'}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-900 truncate pr-2" title={salon.name}>{salon.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                        ★ {salon.rating > 0 ? salon.rating : 'New'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 font-medium">
                      <span className="flex items-center gap-1.5">
                         <MapPin className="w-4 h-4 text-primary"/> 
                         {salon.distanceMeters != null ? (salon.distanceMeters / 1000).toFixed(1) + ' km away' : 'Nearby'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {salon.startingPrice ? `Starting from ₹${salon.startingPrice}` : 'Price available on request'}
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 mt-auto">
                  <Link to={`/salons/${salon._id}`} className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-primary font-semibold text-sm transition">
                    View Shop
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNearbySalons(page + 1)}
                disabled={loading}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    
      



    </PageShell>
  );
};


export const SearchBarbers = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [salon, setSalon] = useState('');
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availableOn, setAvailableOn] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchBarbers = async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (salon) params.salon = salon;
      if (city) params.city = city;
      if (city) params.location = city;
      if (minRating) params.minRating = minRating;
      if (availableOn) params.availableOn = availableOn;
      params.page = nextPage;
      params.limit = 9;
      const response = await api.get('/barbers', { params });
      const result = response.data || {};
      setBarbers(Array.isArray(result.data) ? result.data : []);
      setPage(Number(result.page) || nextPage);
      setPages(Math.max(Number(result.pages) || 1, 1));
    } catch (err) {
      console.error('Failed to fetch barbers:', err);
      setError('Failed to load barbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBarbers(1);
  };

  return (
    <PageShell
      eyebrow="Meet talented barbers"
      title="Search barbers by specialty"
      description="Find barbers who match your style, service, and availability."
    >
      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Specialization (e.g. fades)…"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Salon name…"
          value={salon}
          onChange={(e) => setSalon(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Location or city…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any rating</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
        <select
          value={availableOn}
          onChange={(e) => setAvailableOn(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any day</option>
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchBarbers(page)} />
      ) : barbers.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-10 text-center">
          <p className="text-slate-500 text-sm font-medium">No barbers found matching your search.</p>
          <p className="mt-1 text-slate-400 text-xs">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {barbers.map((barber) => (
            <div key={barber._id} className={panelClasses}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{barber.user?.name || barber.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {barber.specialization?.join(', ') || barber.bio || 'Professional Barber'}
                  </p>
                  {barber.salonId?.name && (
                    <p className="mt-1 text-xs text-slate-400">{barber.salonId.name} · {barber.salonId.city}</p>
                  )}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  ★ {barber.rating > 0 ? barber.rating : 'New'}
                </span>
              </div>
              <Link to={`/barbers/${barber._id}`} className="mt-5 inline-flex text-sm font-semibold text-primary">View profile</Link>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-600">
          <button type="button" disabled={page <= 1} onClick={() => fetchBarbers(page - 1)} className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-40">Previous</button>
          <span>Page {page} of {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => fetchBarbers(page + 1)} className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    
      



    </PageShell>
  );
};


const ReviewsList = ({ salonId }) => {
  
  const [isFavorite, setIsFavorite] = React.useState(false);

  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/salon/${salonId}`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [salonId]);

  if (loading) return <div className="py-4 text-slate-500">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="py-4 text-slate-500">No reviews yet.</div>;

  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-slate-900">{r.customer?.name || 'Customer'}</p>
              <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
              ))}
            </div>
          </div>
          {r.serviceName && <p className="text-xs font-semibold text-primary mb-2">{r.serviceName}</p>}
          {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
};

export const SalonDetails = () => {
  const { id } = useParams();
  const { selectedLocation } = useSelector(state => state.location || {});
  
  
  const [salon, setSalon] = React.useState(null);
  const [liveQueue, setLiveQueue] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState(null);
  
  
  const handleJoinQueue = async () => {
    try {
       await api.post('/queue/join', { shopId: id, serviceIds: selectedServiceIds });
       toast.success('Successfully joined walk-in queue!');
       navigate('/dashboard');
    } catch(err) {
       toast.error(err.response?.data?.message || 'Failed to join queue');
    }
  };

  const [searchService, setSearchService] = React.useState('');
  
  const location = window.location;
  const initialState = window.history.state?.usr?.selectedServiceIds || [];
  const [selectedServiceIds, setSelectedServiceIds] = React.useState(initialState);

  
  // Phase 5: Availability State
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState(null);

  const [isBooking, setIsBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(null);
  const [bookingMode, setBookingMode] = React.useState(null); // 'schedule' or null
  const { user } = useSelector(state => state.auth || {});
  const navigate = useNavigate();

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
        try {
           const qRes = await api.get(`/queue/shop/${id}`);
           setLiveQueue(qRes.data);
        } catch (e) {
           console.log("No queue data available");
        }

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
    
      



          {/* Sticky Cart / Checkout Bar for Phase 19 & 21 */}

          {/* Sticky Cart / Checkout Bar */}
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
  const dateOptions = Array.from({length: 30}).map((_, i) => {
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

                         {/* Coupon Section */}
                         <div className="mt-4 mb-6">
                           {!appliedCoupon ? (
                             <div>
                               <div className="flex gap-2">
                                 <input 
                                   type="text" 
                                   placeholder="Promo code" 
                                   value={couponCode}
                                   onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                   className="flex-1 rounded-xl border border-slate-200 px-4 py-2 uppercase font-bold focus:border-slate-900 focus:ring-0"
                                 />
                                 <button 
                                   onClick={handleApplyCoupon}
                                   disabled={isApplyingCoupon || !couponCode}
                                   className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
                                 >
                                   {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                 </button>
                               </div>
                               {couponError && <p className="text-red-500 text-xs font-bold mt-2">{couponError}</p>}
                             </div>
                           ) : (
                             <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                               <div>
                                 <p className="text-green-700 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Code {appliedCoupon.coupon.code} applied!</p>
                                 <p className="text-green-600 text-xs mt-0.5">You save ₹{appliedCoupon.discountAmount}</p>
                               </div>
                               <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                             </div>
                           )}
                         </div>

                         
                         {/* Loyalty Points Section */}
                         {user?.loyaltyPoints > 0 && (
                           <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center">
                             <div>
                               <p className="font-bold text-purple-900">Loyalty Balance: {user.loyaltyPoints} pts</p>
                               <p className="text-xs text-purple-700 mt-1">Use points for extra discount (10 pts = ₹1)</p>
                             </div>
                             <div className="flex items-center gap-2">
                               <input 
                                 type="number" 
                                 max={user.loyaltyPoints} 
                                 min="0"
                                 value={redeemPoints}
                                 onChange={e => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, user.loyaltyPoints))}
                                 className="w-20 px-2 py-1 border border-purple-200 rounded text-center font-bold"
                               />
                               <span className="text-sm font-bold text-purple-900">pts</span>
                             </div>
                           </div>
                         )}

                         {/* Updated Pricing Summary */}

                         {(appliedCoupon || redeemPoints > 0) && (
                           
                           <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex justify-between text-sm text-slate-500 mb-2">
                               <span>Original Price</span>
                               <span className="line-through">₹{appliedCoupon ? appliedCoupon.originalPrice : (activeServices.find(x => x._id === selectedServiceId)?.price || 0)}</span>
                             </div>
                             {appliedCoupon && (
                               <div className="flex justify-between text-sm text-green-600 font-bold mb-2">
                                 <span>Coupon Discount</span>
                                 <span>-₹{appliedCoupon.discountAmount}</span>
                               </div>
                             )}
                             {redeemPoints > 0 && (
                               <div className="flex justify-between text-sm text-purple-600 font-bold mb-3 pb-3 border-b border-slate-200">
                                 <span>Points Redeemed ({redeemPoints})</span>
                                 <span>-₹{Math.floor(redeemPoints / 10)}</span>
                               </div>
                             )}
                             <div className="flex justify-between font-black text-slate-900 text-lg">
                               <span>Total</span>
                               <span>₹{Math.max(0, (appliedCoupon ? appliedCoupon.finalPrice : (activeServices.find(x => x._id === selectedServiceId)?.price || 0)) - Math.floor(redeemPoints / 10))}</span>
                             </div>
                           </div>
                         )}

                 {bookingSuccess ? (
                   <div className="pt-4 border-t border-slate-200 mt-6 animate-in slide-in-from-bottom-4">
                     <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                       <h4 className="font-bold text-green-700 flex items-center gap-2">✓ Booking {bookingSuccess.bookingType === 'scheduled' ? 'Scheduled' : 'Confirmed'}</h4>
                       <p className="text-sm text-green-600 mt-1">Your appointment is confirmed for {bookingSuccess.date ? new Date(bookingSuccess.date).toLocaleDateString() : selectedDate} at {bookingSuccess.time || selectedSlot}.</p>
                       <p className="text-xs font-bold text-green-700 mt-2">Booking ID: {bookingSuccess._id.substring(0, 8).toUpperCase()}</p>
                     </div>
                     <button onClick={() => navigate('/bookings')} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800">
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
                             
                             const res = await api.post('/appointments/instant', { shopId: id, serviceIds: selectedServiceIds,
                                 couponCode: appliedCoupon?.coupon?.code,
                                 redeemPoints, couponCode: appliedCoupon?.coupon?.code });
                             const apt = res.data.data;
                             if (apt.paymentStatus === 'pending') {
                               const payRes = await api.post('/payments/create-checkout-session', { appointmentId: apt._id });
                               if (payRes.data.payment?.url) {
                                  window.location.href = payRes.data.payment.url;
                                  return;
                               }
                             }
                             setBookingSuccess(apt);

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
                                 serviceIds: selectedServiceIds,
                                 couponCode: appliedCoupon?.coupon?.code,
                                 redeemPoints,
                                 date: selectedDate,
                                 startTime: selectedSlot
                               });
                               const apt = res.data.data;
                               if (apt.paymentStatus === 'pending') {
                                 const payRes = await api.post('/payments/create-checkout-session', { appointmentId: apt._id });
                                 if (payRes.data.payment?.url) {
                                    window.location.href = payRes.data.payment.url;
                                    return;
                                 }
                               }
                               setBookingSuccess(apt);

                           } catch (err) {
                             setBookingError(err.response?.data?.message || 'We couldn\'t schedule your appointment. Please try again.');
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

        </div>
      </div>
    
      



    </PageShell>
  );
};


export const BarberProfile = () => (
  <PageShell
    eyebrow="Barber profile"
    title="Asha Rivera"
    description="Trusted for clean fades, modern styling, and a relaxed consultation experience."
  >
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">About the barber</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Asha has over eight years of experience working with clients who want polished, versatile looks. She is especially known for sharp fades and tailored grooming guidance.</p>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Services</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-2xl bg-slate-50 p-3">Skin fade — $40</li>
          <li className="rounded-2xl bg-slate-50 p-3">Classic cut — $35</li>
          <li className="rounded-2xl bg-slate-50 p-3">Hot towel shave — $30</li>
        </ul>
      </div>
    </div>
  
      



    </PageShell>
);

export const BookingPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // 1: service, 2: datetime, 3: confirm
  const [salons, setSalons] = useState([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const services = [
    { name: 'Classic Haircut', duration: 30, price: 200, icon: '✂️' },
    { name: 'Beard Trim', duration: 15, price: 100, icon: '🧔' },
    { name: 'Hair Color', duration: 60, price: 800, icon: '🎨' },
    { name: 'Facial', duration: 45, price: 500, icon: '💆' },
  ];

  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const [form, setForm] = useState({
    service: null,
    salonId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    notes: '',
  });

  const [fetchError, setFetchError] = useState(null);

  const fetchSalons = () => {
    setLoadingSalons(true);
    setFetchError(null);
    api.get('/salons')
      .then(r => setSalons(r.data.data || []))
      .catch(err => setFetchError(err.customMessage || 'Failed to load salons.'))
      .finally(() => setLoadingSalons(false));
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleBooking = async () => {
    if (!userInfo?.token) {
      setMessage('🔒 Please sign in first to complete your booking.');
      navigate('/register');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const validSalonId = (form.salonId && !form.salonId.startsWith('fallback'))
        ? form.salonId
        : (salons.find((s) => s._id && !s._id.startsWith('fallback'))?._id);

      const response = await api.post('/appointments', {
        salon: validSalonId,
        service: {
          name: form.service?.name || 'Hair Cut & Styling',
          price: form.service?.price || 200,
          duration: form.service?.duration || 30,
        },
        date: form.date,
        time: form.time || '10:00 AM',
        price: form.service?.price || 200,
        notes: form.notes || 'Booked from CutMate app',
      });

      const paymentUrl = response?.data?.payment?.url;
      if (paymentUrl) {
        window.location.assign(paymentUrl);
      } else {
        setMessage('🎉 Appointment successfully booked and confirmed! Check your dashboard.');
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setMessage('🔒 Please sign in first to complete your booking.');
      } else {
        setMessage(error?.response?.data?.message || error?.customMessage || '🎉 Booking confirmed! Check your dashboard.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const darkPanel = 'rounded-2xl border border-white/10 bg-white/5 p-5';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-400 text-sm font-semibold mb-2">Book Appointment</p>
          <h1 className="text-3xl font-bold text-white">Schedule your visit</h1>
          <p className="text-slate-400 text-sm mt-2">Choose your service, time, and pay securely online.</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-4 mb-10">
          {[{ n: 1, l: 'Service' }, { n: 2, l: 'Date & Time' }, { n: 3, l: 'Confirm' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex items-center gap-2 text-sm font-semibold transition ${
                  step === s.n ? 'text-white' : step > s.n ? 'text-purple-400 hover:text-purple-300' : 'text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step === s.n ? 'bg-purple-600 border-purple-600 text-white' :
                  step > s.n ? 'bg-purple-900/50 border-purple-500 text-purple-300' :
                  'bg-transparent border-white/20 text-slate-500'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                {s.l}
              </button>
              {i < 2 && <div className={`flex-1 h-px ${step > s.n ? 'bg-purple-600/40' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Choose a service</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map(srv => (
                <button
                  key={srv.name}
                  onClick={() => setForm(f => ({ ...f, service: srv }))}
                  className={`text-left rounded-2xl p-4 border transition flex items-center gap-4 ${
                    form.service?.name === srv.name
                      ? 'border-purple-500 bg-purple-900/20 ring-1 ring-purple-500'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{srv.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{srv.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{srv.duration} min · ₹{srv.price}</p>
                  </div>
                  {form.service?.name === srv.name && (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white">✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* Salon selector */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-3">Choose a salon</h2>
              <div className={`${darkPanel}`}>
                {loadingSalons ? (
                  <div className="h-10 w-full animate-pulse bg-white/10 rounded-xl" />
                ) : fetchError ? (
                  <div className="flex items-center justify-between text-red-400 text-sm">
                    <span>{fetchError}</span>
                    <button onClick={fetchSalons} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs">Retry</button>
                  </div>
                ) : (
                  <select
                    className="w-full bg-transparent text-white text-sm focus:outline-none"
                    value={form.salonId}
                    onChange={e => setForm(f => ({ ...f, salonId: e.target.value }))}
                  >
                    <option value="" className="bg-[#0a0a0a]">Select a salon...</option>
                    {salons.map(s => (
                      <option key={s._id} value={s._id} className="bg-[#0a0a0a]">
                        {s.name} — {s.city || s.address}
                      </option>
                    ))}
                    {salons.length === 0 && <option value="demo" className="bg-[#0a0a0a]">Demo Salon (Test mode)</option>}
                  </select>
                )}
              </div>
            </div>

            <button
              disabled={!form.service}
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-semibold transition"
            >
              Continue to Date & Time →
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Choose date & time</h2>
            <div className={`${darkPanel} mb-4`}>
              <label className="text-xs text-slate-400 block mb-2 font-medium">Select Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-transparent text-white text-sm focus:outline-none appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <h3 className="text-sm font-semibold text-slate-300 mb-3">Available Times</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
              {times.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, time: t }))}
                  className={`py-2.5 text-sm rounded-xl border font-medium transition ${
                    form.time === t
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className={`${darkPanel} mb-6`}>
              <label className="text-xs text-slate-400 block mb-2 font-medium">Notes (optional)</label>
              <textarea
                className="w-full bg-transparent text-white text-sm focus:outline-none resize-none"
                rows={3}
                placeholder="Any special requests..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/20 hover:bg-white/5 text-white py-3.5 rounded-full font-semibold transition">← Back</button>
              <button
                disabled={!form.time || !form.date}
                onClick={() => setStep(3)}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-semibold transition"
              >
                Review & Pay →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Pay */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Review & confirm</h2>
            <div className={`${darkPanel} mb-4 space-y-4`}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service</span>
                <span className="text-white font-semibold">{form.service?.name} {form.service?.icon}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="text-white">{form.service?.duration} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{new Date(form.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="text-white">{form.time}</span>
              </div>
              {form.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Notes</span>
                  <span className="text-white text-right max-w-[60%]">{form.notes}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="text-slate-300 font-semibold">Total</span>
                <span className="text-purple-400 text-xl font-bold">₹{form.service?.price}</span>
              </div>
            </div>

            <div className={`${darkPanel} mb-6 bg-purple-900/10 border-purple-500/20`}>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 text-lg">🔒</span>
                <div>
                  <p className="text-sm font-semibold text-white">Secure payment via Stripe</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    You'll be redirected to Stripe's secure checkout. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`rounded-2xl p-4 mb-4 text-sm font-medium ${
                message.includes('confirmed') || message.includes('🎉')
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/20 hover:bg-white/5 text-white py-3.5 rounded-full font-semibold transition">← Back</button>
              <button
                onClick={handleBooking}
                disabled={submitting}
                className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition shadow-lg shadow-purple-900/30"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Redirecting to payment...</span>
                ) : (
                  `Pay ₹${form.service?.price} & Confirm`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err.customMessage || 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <PageShell
      eyebrow="Careers"
      title="Open jobs and opportunities"
      description="Explore salon and barber roles that match your skills and ambitions."
    >
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-10 text-center">
            <p className="text-slate-500 text-sm font-medium">No open jobs found at the moment.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id || job.title} className={panelClasses}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{job.salon?.name || job.salon} • {job.location || job.salon?.city}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-slate-900">{job.jobType || job.type}</p>
                  <Link to="/jobs/apply" className="mt-2 inline-flex text-sm font-medium text-primary">Apply now</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    
      



    </PageShell>
  );
};

export const ApplyJobPage = () => (
  <PageShell
    eyebrow="Job application"
    title="Apply for a role"
    description="Share your experience and availability so the salon can review your application quickly."
  >
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Application form</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">Role: Senior Stylist</div>
          <div className="rounded-2xl bg-slate-50 p-4">Experience: 5+ years</div>
          <div className="rounded-2xl bg-slate-50 p-4">Availability: Immediate</div>
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Next step</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Once submitted, your application will be visible to the salon owner and you can track its status from your dashboard.</p>
        <button className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Submit application</button>
      </div>
    </div>
  
      



    </PageShell>
);

export const CustomerDashboardPage = () => {
  const [payments, setPayments] = useState([]);

  const handleRefund = async (appointmentId) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/refund`);
      setPayments((current) => current.map((payment) => payment.id === appointmentId ? { ...payment, status: response?.data?.appointment?.paymentStatus === 'refunded' ? 'Refunded' : payment.status } : payment));
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Refund failed');
    }
  };

  return (
    <PageShell eyebrow="Customer dashboard" title="Your appointments and favorites" description="Stay on top of bookings, saved salons, and follow-up reminders.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Upcoming haircut', 'Saved salon', 'Review due'].map((item) => (
          <div key={item} className={panelClasses}>
            <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
            <p className="mt-2 text-sm text-slate-600">This section is ready for live customer data and notifications.</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={panelClasses}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Stripe test mode</span>
          </div>
          <div className="mt-4 space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{payment.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{payment.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{payment.status}</p>
                    {payment.status === 'Paid' ? (
                      <button onClick={() => handleRefund(payment.id)} className="mt-2 rounded-full border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">Refund</button>
                    
      ) : activeTab === 'reviews' ? (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">Review by {r.customer?.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${r.status === 'published' ? 'bg-green-100 text-green-700' : r.status === 'reported' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Shop: {r.salon?.name} • Rating: {r.rating} ★</p>
                <p className="text-sm text-slate-700 mt-2">"{r.comment}"</p>
              </div>
              <div className="flex gap-2">
                {r.status !== 'published' && (
                  <button onClick={() => handleModerateReview(r._id, 'published')} className="px-4 py-2 bg-green-50 text-green-600 font-bold text-sm rounded-xl hover:bg-green-100">Publish</button>
                )}
                {r.status !== 'hidden' && (
                  <button onClick={() => handleModerateReview(r._id, 'hidden')} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200">Hide</button>
                )}
              </div>
            </div>
          ))}
        </div>
      
      
      ) : activeTab === 'support' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Global Support Queue</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{t.subject}</h3>
                    {t.priority === 'high' || t.priority === 'urgent' ? <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase">{t.priority}</span> : null}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">#{t._id.substring(0,8).toUpperCase()} • {t.customer?.name} • {t.shop?.name || 'Platform'} • {t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">Queue is empty.</p>}
          </div>

          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket._id.substring(0,8).toUpperCase()} • {selectedTicket.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-orange-100 text-orange-700' : selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {selectedTicket.status}
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                  {ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900' : (msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-900')}`}>
                        {msg.isInternalNote && <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Internal Note</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{msg.sender?.name} ({msg.senderRole}) • {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {ticketMessages.length === 0 && <p className="text-center text-slate-500">No messages yet.</p>}
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                  {user.role !== 'customer' && selectedTicket.status !== 'closed' && (
                    
                    <div className="flex gap-2 mb-4">
                      {user.role === 'admin' && selectedTicket.booking && selectedTicket.category === 'Refund Request' && selectedTicket.booking.paymentStatus === 'paid' && (
                        <button onClick={handleProcessRefund} className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Process Refund</button>
                      )}

                      {selectedTicket.status !== 'resolved' && <button onClick={() => handleUpdateTicketStatus('resolved')} className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Resolved</button>}
                      {selectedTicket.status !== 'closed' && <button onClick={() => handleUpdateTicketStatus('closed')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Close Ticket</button>}
                    </div>
                  )}
                  
                  {selectedTicket.status !== 'closed' ? (
                    <form onSubmit={handleReplyTicket}>
                      <textarea
                        required
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-900 focus:ring-0 min-h-[100px]"
                      ></textarea>
                      <div className="mt-3 flex justify-between items-center">
                        {user.role === 'admin' ? (
                          <label className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-pointer">
                            <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                            Private Internal Note
                          </label>
                        ) : <div></div>}
                        <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Send Reply</button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-slate-500 font-semibold">This ticket is closed and cannot be replied to.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      ) : activeTab === 'coupons' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminCoupons.map(c => (
            <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-slate-900">{c.code}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">{c.salon?.name || 'Unknown Shop'}</p>
                <p className="text-primary font-bold text-sm mb-4">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </p>
                <p className="text-xs text-slate-500 mb-1">Min Order: ₹{c.minOrderValue}</p>
                <p className="text-xs text-slate-500">Usage: {c.usageCount} / {c.usageLimit || 'Unlimited'}</p>
              </div>
            </div>
          ))}
          {adminCoupons.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No coupons active on platform.</p>}
        </div>

      ) : activeTab === 'logs' ? (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-bold text-slate-900">{log.admin?.name || 'Admin'} performed: <span className="text-primary">{log.action}</span></p>
                <p className="text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-xs text-slate-500">Target: {log.targetType} ({log.targetId})</p>
              {log.reason && <p className="text-xs text-slate-500 mt-1">Reason: {log.reason}</p>}
            </div>
          ))}
        </div>

      
      
      ) : activeTab === 'support' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Shop Support Tickets</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <h3 className="font-bold text-slate-900">{t.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1">Ticket #{t._id.substring(0,8).toUpperCase()} • {t.customer?.name} • {t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">No support tickets for your shop.</p>}
          </div>

          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket._id.substring(0,8).toUpperCase()} • {selectedTicket.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-orange-100 text-orange-700' : selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {selectedTicket.status}
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                  {ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900' : (msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-900')}`}>
                        {msg.isInternalNote && <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Internal Note</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{msg.sender?.name} ({msg.senderRole}) • {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {ticketMessages.length === 0 && <p className="text-center text-slate-500">No messages yet.</p>}
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                  {user.role !== 'customer' && selectedTicket.status !== 'closed' && (
                    
                    <div className="flex gap-2 mb-4">
                      {user.role === 'admin' && selectedTicket.booking && selectedTicket.category === 'Refund Request' && selectedTicket.booking.paymentStatus === 'paid' && (
                        <button onClick={handleProcessRefund} className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Process Refund</button>
                      )}

                      {selectedTicket.status !== 'resolved' && <button onClick={() => handleUpdateTicketStatus('resolved')} className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Resolved</button>}
                      {selectedTicket.status !== 'closed' && <button onClick={() => handleUpdateTicketStatus('closed')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Close Ticket</button>}
                    </div>
                  )}
                  
                  {selectedTicket.status !== 'closed' ? (
                    <form onSubmit={handleReplyTicket}>
                      <textarea
                        required
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-900 focus:ring-0 min-h-[100px]"
                      ></textarea>
                      <div className="mt-3 flex justify-between items-center">
                        {user.role === 'admin' ? (
                          <label className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-pointer">
                            <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                            Private Internal Note
                          </label>
                        ) : <div></div>}
                        <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Send Reply</button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-slate-500 font-semibold">This ticket is closed and cannot be replied to.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      ) : activeTab === 'offers' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Discount Coupons</h2>
            <button onClick={() => setShowCouponModal(true)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 text-sm">
              + Create Coupon
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map(c => (
              <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-slate-900">{c.code}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                  </div>
                  <p className="text-primary font-bold text-sm mb-4">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </p>
                  <p className="text-xs text-slate-500 mb-1">Min Order: ₹{c.minOrderValue}</p>
                  <p className="text-xs text-slate-500">Usage: {c.usageCount} / {c.usageLimit || 'Unlimited'}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  {c.status === 'active' ? (
                    <button onClick={() => handleUpdateCoupon(c._id, { status: 'paused' })} className="text-xs font-bold text-orange-600 hover:underline">Pause</button>
                  ) : (
                    <button onClick={() => handleUpdateCoupon(c._id, { status: 'active' })} className="text-xs font-bold text-green-600 hover:underline">Activate</button>
                  )}
                </div>
              </div>
            ))}
            {coupons.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No coupons created yet.</p>}
          </div>

          {showCouponModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Create Promo Code</h3>
                <form onSubmit={handleSaveCoupon} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Code</label>
                    <input type="text" required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 font-bold uppercase" placeholder="e.g. SAVE20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Type</label>
                      <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 bg-white">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Value</label>
                      <input type="number" required value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder={couponForm.discountType === 'percentage' ? '20' : '100'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Min Order (₹)</label>
                      <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({...couponForm, minOrderValue: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Usage Limit</label>
                      <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="Unlimited" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white hover:bg-slate-800">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

      ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={panelClasses}>
          <h2 className="text-lg font-semibold text-slate-900">Booking confirmation</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Once you complete checkout, the appointment becomes confirmed and moves into your payment history with a simple refund option for test payments.</p>
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Next steps</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Complete checkout in Stripe test mode</li>
              <li>Receive booking confirmation</li>
              <li>Use refund from the history card if needed</li>
            </ul>
          </div>
        </div>
      </div>
    
      



    </PageShell>
  );
};


export const BarberDashboardPage = () => {
  const { user } = useSelector(state => state.auth || {});
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  // Phase 22 States
  const [attendance, setAttendance] = React.useState(null);
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [leaveData, setLeaveData] = React.useState({ leaveType: 'Personal', startDate: '', endDate: '', reason: '' });

  
  const fetchDashboard = async () => {
    
    try {
      setLoading(true);
      const res = await api.get('/staff/dashboard');
      setData(res.data);
      
      const attRes = await api.get('/workforce/attendance/today');
      setAttendance(attRes.data.attendance);
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

  );
};



export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [stats, setStats] = React.useState(null);
  const [shops, setShops] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  
  const [isFavorite, setIsFavorite] = React.useState(false);

  const [reviews, setReviews] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [adminCoupons, setAdminCoupons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useSelector(state => state.auth || {});

  React.useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } else if (tab === 'shops') {
        const res = await api.get('/admin/shops?limit=50');
        setShops(res.data.shops);
            } else if (tab === 'users') {
        const res = await api.get('/admin/users?limit=50');
        setUsers(res.data.users);
      } else if (tab === 'reviews') {
        const res = await api.get('/admin/reviews?limit=50');
        setReviews(res.data.reviews);
            } else if (tab === 'logs') {
        const res = await api.get('/admin/audit-logs?limit=50');
        setLogs(res.data.logs);
      } else if (tab === 'coupons') {
        const res = await api.get('/admin/coupons?limit=50');
        setAdminCoupons(res.data.coupons);
      } else if (tab === 'support') {
        const res = await api.get('/tickets/admin');
        setTickets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyShop = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this shop as ${status}?`)) return;
    try {
      await api.put(`/admin/shops/${id}/verification`, { status });
      fetchData('shops');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating shop');
    }
  };


  const handleModerateReview = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this review as ${status}?`)) return;
    try {
      await api.put(`/admin/reviews/${id}/moderate`, { status, reason: 'Admin moderation' });
      fetchData('reviews');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating review');
    }
  };

  const handleUserStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this user?`)) return;
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      fetchData('users');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-10 text-center text-red-500 font-bold">Unauthorized. Super Admin access required.</div>;
  }

  return (
    <PageShell eyebrow="Super Admin" title="Platform Management" description="Central administration for marketplace control.">
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                                {['dashboard', 'shops', 'users', 'reviews', 'coupons', 'support', 'logs'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-bold capitalize whitespace-nowrap transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : activeTab === 'dashboard' && stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Customers</h3>
            <p className="text-4xl font-black text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Shops</h3>
            <p className="text-4xl font-black text-slate-900">{stats.totalShops}</p>
            <p className="text-sm font-medium text-slate-500 mt-2">{stats.verifiedShops} Verified • {stats.pendingShops} Pending</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</h3>
            <p className="text-4xl font-black text-green-600">₹{stats.totalRevenue}</p>
            <p className="text-sm font-medium text-slate-500 mt-2">From {stats.completedBookings} completed bookings</p>
          </div>
        </div>
      ) : activeTab === 'shops' ? (
        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{shop.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${shop.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : shop.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {shop.verificationStatus}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{shop.owner?.name} • {shop.city}, {shop.state}</p>
              </div>
              <div className="flex gap-2">
                {shop.verificationStatus !== 'approved' && (
                  <button onClick={() => handleVerifyShop(shop._id, 'approved')} className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800">Approve</button>
                )}
                {shop.verificationStatus !== 'rejected' && (
                  <button onClick={() => handleVerifyShop(shop._id, 'rejected')} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100">Reject</button>
                )}
                {shop.verificationStatus === 'approved' && (
                  <button onClick={() => handleVerifyShop(shop._id, 'suspended')} className="px-4 py-2 bg-orange-50 text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-100">Suspend</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'users' ? (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{u.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{u.email} • Role: {u.role}</p>
              </div>
              {u.role !== 'admin' && (
                <div className="flex gap-2">
                  {u.status === 'active' ? (
                    <button onClick={() => handleUserStatus(u._id, 'suspended')} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100">Suspend</button>
                  ) : (
                    <button onClick={() => handleUserStatus(u._id, 'active')} className="px-4 py-2 bg-green-50 text-green-600 font-bold text-sm rounded-xl hover:bg-green-100">Reactivate</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      
      ) : activeTab === 'reviews' ? (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">Review by {r.customer?.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${r.status === 'published' ? 'bg-green-100 text-green-700' : r.status === 'reported' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Shop: {r.salon?.name} • Rating: {r.rating} ★</p>
                <p className="text-sm text-slate-700 mt-2">"{r.comment}"</p>
              </div>
              <div className="flex gap-2">
                {r.status !== 'published' && (
                  <button onClick={() => handleModerateReview(r._id, 'published')} className="px-4 py-2 bg-green-50 text-green-600 font-bold text-sm rounded-xl hover:bg-green-100">Publish</button>
                )}
                {r.status !== 'hidden' && (
                  <button onClick={() => handleModerateReview(r._id, 'hidden')} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200">Hide</button>
                )}
              </div>
            </div>
          ))}
        </div>
      
      
      ) : activeTab === 'support' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Global Support Queue</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{t.subject}</h3>
                    {t.priority === 'high' || t.priority === 'urgent' ? <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase">{t.priority}</span> : null}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">#{t._id.substring(0,8).toUpperCase()} • {t.customer?.name} • {t.shop?.name || 'Platform'} • {t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">Queue is empty.</p>}
          </div>

          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket._id.substring(0,8).toUpperCase()} • {selectedTicket.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-orange-100 text-orange-700' : selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {selectedTicket.status}
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                  {ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900' : (msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-900')}`}>
                        {msg.isInternalNote && <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Internal Note</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{msg.sender?.name} ({msg.senderRole}) • {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {ticketMessages.length === 0 && <p className="text-center text-slate-500">No messages yet.</p>}
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                  {user.role !== 'customer' && selectedTicket.status !== 'closed' && (
                    
                    <div className="flex gap-2 mb-4">
                      {user.role === 'admin' && selectedTicket.booking && selectedTicket.category === 'Refund Request' && selectedTicket.booking.paymentStatus === 'paid' && (
                        <button onClick={handleProcessRefund} className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Process Refund</button>
                      )}

                      {selectedTicket.status !== 'resolved' && <button onClick={() => handleUpdateTicketStatus('resolved')} className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Resolved</button>}
                      {selectedTicket.status !== 'closed' && <button onClick={() => handleUpdateTicketStatus('closed')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Close Ticket</button>}
                    </div>
                  )}
                  
                  {selectedTicket.status !== 'closed' ? (
                    <form onSubmit={handleReplyTicket}>
                      <textarea
                        required
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-900 focus:ring-0 min-h-[100px]"
                      ></textarea>
                      <div className="mt-3 flex justify-between items-center">
                        {user.role === 'admin' ? (
                          <label className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-pointer">
                            <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                            Private Internal Note
                          </label>
                        ) : <div></div>}
                        <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Send Reply</button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-slate-500 font-semibold">This ticket is closed and cannot be replied to.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      ) : activeTab === 'coupons' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminCoupons.map(c => (
            <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-slate-900">{c.code}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">{c.salon?.name || 'Unknown Shop'}</p>
                <p className="text-primary font-bold text-sm mb-4">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </p>
                <p className="text-xs text-slate-500 mb-1">Min Order: ₹{c.minOrderValue}</p>
                <p className="text-xs text-slate-500">Usage: {c.usageCount} / {c.usageLimit || 'Unlimited'}</p>
              </div>
            </div>
          ))}
          {adminCoupons.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No coupons active on platform.</p>}
        </div>

      ) : activeTab === 'logs' ? (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-bold text-slate-900">{log.admin?.name || 'Admin'} performed: <span className="text-primary">{log.action}</span></p>
                <p className="text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-xs text-slate-500">Target: {log.targetType} ({log.targetId})</p>
              {log.reason && <p className="text-xs text-slate-500 mt-1">Reason: {log.reason}</p>}
            </div>
          ))}
        </div>

      
      
      ) : activeTab === 'support' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Shop Support Tickets</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <h3 className="font-bold text-slate-900">{t.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1">Ticket #{t._id.substring(0,8).toUpperCase()} • {t.customer?.name} • {t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">No support tickets for your shop.</p>}
          </div>

          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket._id.substring(0,8).toUpperCase()} • {selectedTicket.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-orange-100 text-orange-700' : selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {selectedTicket.status}
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                  {ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900' : (msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-900')}`}>
                        {msg.isInternalNote && <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Internal Note</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{msg.sender?.name} ({msg.senderRole}) • {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {ticketMessages.length === 0 && <p className="text-center text-slate-500">No messages yet.</p>}
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                  {user.role !== 'customer' && selectedTicket.status !== 'closed' && (
                    
                    <div className="flex gap-2 mb-4">
                      {user.role === 'admin' && selectedTicket.booking && selectedTicket.category === 'Refund Request' && selectedTicket.booking.paymentStatus === 'paid' && (
                        <button onClick={handleProcessRefund} className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Process Refund</button>
                      )}

                      {selectedTicket.status !== 'resolved' && <button onClick={() => handleUpdateTicketStatus('resolved')} className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Resolved</button>}
                      {selectedTicket.status !== 'closed' && <button onClick={() => handleUpdateTicketStatus('closed')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Close Ticket</button>}
                    </div>
                  )}
                  
                  {selectedTicket.status !== 'closed' ? (
                    <form onSubmit={handleReplyTicket}>
                      <textarea
                        required
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-900 focus:ring-0 min-h-[100px]"
                      ></textarea>
                      <div className="mt-3 flex justify-between items-center">
                        {user.role === 'admin' ? (
                          <label className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-pointer">
                            <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                            Private Internal Note
                          </label>
                        ) : <div></div>}
                        <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Send Reply</button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-slate-500 font-semibold">This ticket is closed and cannot be replied to.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      ) : activeTab === 'offers' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Discount Coupons</h2>
            <button onClick={() => setShowCouponModal(true)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 text-sm">
              + Create Coupon
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map(c => (
              <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-slate-900">{c.code}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                  </div>
                  <p className="text-primary font-bold text-sm mb-4">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </p>
                  <p className="text-xs text-slate-500 mb-1">Min Order: ₹{c.minOrderValue}</p>
                  <p className="text-xs text-slate-500">Usage: {c.usageCount} / {c.usageLimit || 'Unlimited'}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  {c.status === 'active' ? (
                    <button onClick={() => handleUpdateCoupon(c._id, { status: 'paused' })} className="text-xs font-bold text-orange-600 hover:underline">Pause</button>
                  ) : (
                    <button onClick={() => handleUpdateCoupon(c._id, { status: 'active' })} className="text-xs font-bold text-green-600 hover:underline">Activate</button>
                  )}
                </div>
              </div>
            ))}
            {coupons.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No coupons created yet.</p>}
          </div>

          {showCouponModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Create Promo Code</h3>
                <form onSubmit={handleSaveCoupon} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Code</label>
                    <input type="text" required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 font-bold uppercase" placeholder="e.g. SAVE20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Type</label>
                      <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 bg-white">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Value</label>
                      <input type="number" required value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder={couponForm.discountType === 'percentage' ? '20' : '100'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Min Order (₹)</label>
                      <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({...couponForm, minOrderValue: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Usage Limit</label>
                      <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="Unlimited" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white hover:bg-slate-800">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

      ) : null}
    
      



    </PageShell>
  );
};


export const ProfilePage = () => {
  const userInfo = (() => {
    try {
      const raw = localStorage.getItem('userInfo');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  if (!userInfo) {
    return (
      <PageShell eyebrow="Profile" title="Your profile" description="Sign in to view and manage your personal details.">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 text-5xl shadow-inner">
            👤
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Not signed in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            Please login or create an account to view your profile.
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      
      



    </PageShell>
    );
  }

  const initials = (userInfo.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fields = [
    { label: '👤 Full Name', value: userInfo.name || '—' },
    { label: '📧 Email', value: userInfo.email || '—' },
    { label: '🎭 Role', value: userInfo.role ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : 'Customer' },
    { label: '📱 Phone', value: userInfo.phone || 'Not provided' },
  ];

  return (
    <PageShell eyebrow="Profile" title="Your profile" description="Manage your personal details.">
      <div className={panelClasses}>
        {/* Avatar + Name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-2xl font-bold text-white shadow-lg shadow-primary/30 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userInfo.name || 'User'}</h2>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              {userInfo.role ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : 'Customer'}
            </span>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    
      



    </PageShell>
  );
};


export const SettingsPage = () => (
  <PageShell eyebrow="Settings" title="Preferences and account settings" description="Adjust notifications, privacy, and account details for your experience.">
    <div className={panelClasses}>
      <h2 className="text-lg font-semibold text-slate-900">Account preferences</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-4">Email reminders: Enabled</div>
        <div className="rounded-2xl bg-slate-50 p-4">SMS alerts: Disabled</div>
        <div className="rounded-2xl bg-slate-50 p-4">Privacy mode: Standard</div>
      </div>
    </div>
  
      



    </PageShell>
);

export const NotificationsPage = () => (
  <PageShell eyebrow="Notifications" title="Recent updates" description="Review appointment reminders, new offers, and job status changes.">
    <div className="space-y-4">
      {['Your booking is confirmed', 'A new job match is available', 'A salon sent you a reminder'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">Notifications are ready for live event-driven content.</p>
        </div>
      ))}
    </div>
  
      



    </PageShell>
);
