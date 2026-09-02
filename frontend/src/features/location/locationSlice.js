import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedLocation: {
    latitude: null,
    longitude: null,
    displayName: '', // string for UI (e.g. 'Pimpri, Pune')
    source: null, // 'current' or 'manual'
  }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    clearLocation: (state) => {
      state.selectedLocation = initialState.selectedLocation;
    }
  }
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
