export const LocationService = {
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  },

  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (!response.ok) throw new Error('Failed to reverse geocode');
      const data = await response.json();
      
      const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
      const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential;
      
      let displayName = city;
      if (suburb && city) displayName = `${suburb}, ${city}`;
      else if (suburb) displayName = suburb;
      
      return displayName || "Unknown Location";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Current Location";
    }
  },

  searchLocation: async (query) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (!response.ok) throw new Error('Failed to search location');
      const data = await response.json();
      return data.map(item => ({
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error("Geocoding search error:", error);
      return [];
    }
  }
};
