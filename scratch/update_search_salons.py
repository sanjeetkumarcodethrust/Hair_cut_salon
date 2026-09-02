import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "SlidersHorizontal" not in content:
    content = content.replace("import { MapPin, Search, Navigation, X } from 'lucide-react';", "import { MapPin, Search, Navigation, X, SlidersHorizontal, Tag, Star } from 'lucide-react';")
    
search_salons_code = """export const SearchSalons = () => {
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
};"""

start_idx = content.find('export const SearchSalons = () => {')
end_idx = content.find('export const SearchBarbers = () => {')

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + search_salons_code + '\n\n\n' + content[end_idx:]
    with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated SearchSalons component with Phase 3 filters.')
else:
    print('Could not find SearchSalons or SearchBarbers export.')
