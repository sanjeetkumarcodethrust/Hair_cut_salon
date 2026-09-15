import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../features/location/locationSlice';
import { MapPin, Search, Crosshair, X, Loader2, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationSelector = () => {
  const dispatch = useDispatch();
  const { selectedLocation } = useSelector((state) => state.location);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchLocations = async (query) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectLocation = (place) => {
    // Attempt to extract a cleaner name from display_name
    const parts = place.display_name.split(',');
    const displayName = parts.length >= 2 ? `${parts[0].trim()}, ${parts[1].trim()}` : place.display_name;
    
    dispatch(setLocation({
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      displayName: displayName,
      source: 'manual'
    }));
    
    toast.success(`Location set to ${displayName}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleDetectLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("Failed to fetch location from API");
            
            const data = await res.json();
            
            const address = data.address || {};
            // Attempt to get a meaningful name from address components
            const area = address.suburb || address.neighbourhood || address.residential || address.city_district || "";
            const city = address.city || address.town || address.village || address.county || "";
            
            let displayName = 'Current Location';
            if (area && city) {
              displayName = `${area}, ${city}`;
            } else if (city) {
              displayName = city;
            } else if (data.display_name) {
              // Fallback to the first two parts of the full display name
              const parts = data.display_name.split(',');
              displayName = parts.slice(0, 2).join(',').trim();
            }
            
            dispatch(setLocation({
              latitude,
              longitude,
              displayName,
              source: 'current'
            }));
            toast.success(`Location set to ${displayName}`);
            setIsOpen(false);
          } catch (error) {
            console.error("Error getting location details", error);
            // Fallback if reverse geocoding fails
            dispatch(setLocation({
              latitude,
              longitude,
              displayName: 'Current Location',
              source: 'current'
            }));
            toast.success("Location set using GPS");
            setIsOpen(false);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (error.code === 1) toast.error("Please allow location access in your browser settings.");
          else toast.error("Failed to detect location. Please try searching manually.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLoading(false);
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // If there's no location set yet, default to Mumbai, India
  const displayLoc = selectedLocation?.displayName || 'Mumbai, India';

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center gap-2 text-base text-white cursor-pointer hover:text-amber-400 transition px-2 py-1.5 rounded-lg hover:bg-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <span className="truncate max-w-[160px] sm:max-w-[250px] font-bold tracking-wide">{displayLoc}</span>
        <span className="text-[12px] ml-1 text-slate-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 w-80 sm:w-96 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for your city or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                autoComplete="off"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-amber-500/50 transition placeholder:text-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1">
            {!searchQuery && (
              <button 
                onClick={handleDetectLocation}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 text-amber-500 hover:bg-white/5 transition border-b border-white/5"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                ) : (
                  <Crosshair className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="text-left">
                  <p className="font-semibold text-sm">Detect current location</p>
                  <p className="text-xs text-amber-500/70 mt-0.5">Using GPS</p>
                </div>
              </button>
            )}

            {searchLoading && (
              <div className="p-6 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Searching locations...</p>
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Search Results
                </div>
                {searchResults.map((place) => {
                  const parts = place.display_name.split(',');
                  const mainText = parts[0];
                  const subText = parts.slice(1).join(',').trim();
                  
                  return (
                    <button
                      key={place.place_id}
                      onClick={() => handleSelectLocation(place)}
                      className="w-full flex items-start gap-3 p-4 hover:bg-white/5 transition text-left"
                    >
                      <Navigation className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{mainText}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subText}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {!searchLoading && searchQuery.trim().length > 2 && searchResults.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <p className="text-sm">No locations found</p>
                <p className="text-xs mt-1">Try searching for a different area or city</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
