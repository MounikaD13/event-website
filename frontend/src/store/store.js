import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import userAccountReducer from './slices/userAccountSlice';
import adminReducer from './slices/adminSlice';
import servicesReducer from './slices/servicesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    userAccount: userAccountReducer,
    admin: adminReducer,
    services: servicesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;