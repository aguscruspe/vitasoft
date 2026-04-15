import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pagosReducer from './pagosSlice';
import lotesReducer from './lotesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pagos: pagosReducer,
    lotes: lotesReducer,
  },
});

export default store;
