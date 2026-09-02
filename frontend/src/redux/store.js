import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import locationReducer from '../features/location/locationSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
