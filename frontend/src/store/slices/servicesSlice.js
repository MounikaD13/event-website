import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchServicesByEvent = createAsyncThunk(
  'services/fetchByEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/event/${eventId}`);
      return response.data.services;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/services/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearServices: (state) => {
      state.services = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesByEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServicesByEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s._id !== action.payload);
      });
  },
});

export const { clearServices } = servicesSlice.actions;
export default servicesSlice.reducer;