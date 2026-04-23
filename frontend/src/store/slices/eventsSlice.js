import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchEvents = createAsyncThunk('events/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/events');
    return data.events;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch events');
  }
});

export const fetchEventById = createAsyncThunk('events/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/events/${id}`);
    return data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch event details');
  }
});

export const createEvent = createAsyncThunk('events/create', async (eventData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/events', eventData);
    return data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create event');
  }
});

export const updateEvent = createAsyncThunk('events/update', async ({ id, eventData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/events/${id}`, eventData);
    return data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update event');
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/events/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete event');
  }
});

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch One
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEvent = action.payload;
      })
      // Create
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.unshift(action.payload);
      })
      // Update
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.currentEvent?._id === action.payload._id) {
          state.currentEvent = action.payload;
        }
      })
      // Delete
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e._id !== action.payload);
      });
  },
});

export const { clearCurrentEvent, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
