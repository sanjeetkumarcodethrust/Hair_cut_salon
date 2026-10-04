import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedLocation: {
    latitude: null,
    longitude: null,
    displayName: '', // string for UI (e.g. 'Pimpri, Pune')
    source: null, // 'current' or 'manual'
    radius: 10000, // Default 10km radius
  }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.selectedLocation = { ...state.selectedLocation, ...action.payload };
    },
    setRadius: (state, action) => {
      if (state.selectedLocation) {
        state.selectedLocation.radius = action.payload;
      }
    },
    clearLocation: (state) => {
      state.selectedLocation = initialState.selectedLocation;
    }
  }
});

export const { setLocation, setRadius, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
