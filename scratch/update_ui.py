import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

imports_to_add = """import { useDispatch } from 'react-redux';
import { setLocation } from '../features/location/locationSlice.js';
import { LocationService } from '../services/LocationService.js';
import { MapPin, Search, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
"""

if 'import { useDispatch' not in content:
    content = content.replace("import { useSelector } from 'react-redux';", "import { useSelector } from 'react-redux';\n" + imports_to_add)

search_salons_code = """export const SearchSalons = () => {
  const dispatch = useDispatch();
  const { selectedLocation } = useSelector(state => state.location || {});
  
  const [salons, setSalons] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const [locationQuery, setLocationQuery] = React.useState('');
  const [locationResults, setLocationResults] = React.useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = React.useState(false);

  React.useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      fetchNearbySalons(1);
    } else {
      setShowLocationPicker(true);
      setSalons([]);
    }
  }, [selectedLocation?.latitude, selectedLocation?.longitude]);

  const fetchNearbySalons = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/salons/nearby', {
        params: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          page: pageNum,
          limit: 12,
          radius: 5000
        }
      });
      if (pageNum === 1) {
        setSalons(response.data.data || []);
      } else {
        setSalons(prev => [...prev, ...(response.data.data || [])]);
      }
      setHasMore(response.data.hasMore);
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
    dispatch(setLocation({
      ...loc,
      source: 'manual'
    }));
    setShowLocationPicker(false);
    setLocationResults([]);
    setLocationQuery('');
  };

  return (
    <PageShell
      eyebrow="Nearby Discovery"
      title="Find Barber Shops Near You"
      description="Discover the best salons and barbers in your area based on your location."
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
              >
                ✕
              </button>
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

      {!selectedLocation?.latitude ? null : loading && page === 1 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchNearbySalons(1)} />
      ) : salons.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-10 text-center">
          <p className="text-slate-900 text-lg font-bold mb-2">No barber shops found nearby.</p>
          <p className="text-slate-500 text-sm">Try:<br/>• searching a larger area<br/>• changing your location<br/>• searching another locality</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Nearby Barber Shops</h2>
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
    print('Updated SearchSalons component.')
else:
    print('Could not find SearchSalons or SearchBarbers export.')
