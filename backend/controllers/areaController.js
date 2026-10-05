export const searchAreas = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Geoapify API key not configured' });
    }
    
    // Call Geoapify Geocoding API
    const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&format=json&apiKey=${apiKey}`);
    const data = await response.json();
    
    if (data.results) {
      const formattedResults = data.results.map(item => {
        let displayName = item.formatted;
        if (item.suburb && item.city) {
          displayName = `${item.suburb}, ${item.city}`;
        } else if (item.city) {
          displayName = item.city;
        }
        return {
          name: displayName,
          latitude: item.lat,
          longitude: item.lon,
          full_address: item.formatted,
          place_id: item.place_id
        };
      });
      return res.status(200).json({ success: true, results: formattedResults });
    }
    
    res.status(200).json({ success: true, results: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reverseSearch = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Geoapify API key not configured' });
    }

    const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      let displayName = item.formatted;
      if (item.suburb && item.city) {
        displayName = `${item.suburb}, ${item.city}`;
      } else if (item.city) {
        displayName = item.city;
      }
      return res.status(200).json({ 
        success: true, 
        result: {
          name: displayName,
          latitude: item.lat,
          longitude: item.lon,
          full_address: item.formatted,
          place_id: item.place_id
        }
      });
    }

    res.status(200).json({ success: true, result: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
