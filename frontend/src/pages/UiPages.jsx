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

export const SalonDetails = () => {
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

export const BarberDashboardPage = () => (
  <PageShell eyebrow="Barber dashboard" title="Manage your day" description="Track bookings, availability, and client requests from a single place.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {["Today's bookings", 'Open requests', 'Weekly earnings'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This page can be connected to your barber workflow and calendar.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const OwnerDashboardPage = () => (
  <PageShell eyebrow="Owner dashboard" title="Run your salon operations" description="Monitor staff activity, revenue, and incoming bookings without leaving the platform.">
    <div className="mb-6 flex justify-end">
      <Link to="/salons/new" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        + Add New Salon
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This workspace is ready for owner-specific management views.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const AdminDashboardPage = () => (
  <PageShell eyebrow="Admin dashboard" title="Platform oversight" description="Review users, salons, barbers, and reports from a central administration view.">
    <div className="mb-6 flex justify-end">
      <Link to="/salons/new" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        + Add New Salon
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['User management', 'Salon approvals', 'Reports center'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This dashboard can be connected to the admin backend when ready.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

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
