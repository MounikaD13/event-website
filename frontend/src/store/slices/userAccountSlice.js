import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  dashboard: {
    inquiries: [],
    bookings: [],
    chats: [],
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchDashboardData = createAsyncThunk('userAccount/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard');
    return data.dashboard;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load dashboard');
  }
});

export const submitInquiry = createAsyncThunk('userAccount/submitInquiry', async (inquiryData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/dashboard/inquiry', inquiryData);
    return data.inquiries;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to submit inquiry');
  }
});

export const submitChat = createAsyncThunk('userAccount/submitChat', async (message, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/dashboard/chat', { message });
    return data.chats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to send message');
  }
});

export const cancelInquiry = createAsyncThunk('userAccount/cancelInquiry', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/dashboard/inquiry/${id}`);
    return data.inquiries;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to cancel inquiry');
  }
});

const userAccountSlice = createSlice({
  name: 'userAccount',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.dashboard = initialState.dashboard;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Inquiry
      .addCase(submitInquiry.fulfilled, (state, action) => {
        state.dashboard.inquiries = action.payload;
      })
      // Submit Chat
      .addCase(submitChat.fulfilled, (state, action) => {
        state.dashboard.chats = action.payload;
      })
      // Cancel Inquiry
      .addCase(cancelInquiry.fulfilled, (state, action) => {
        state.dashboard.inquiries = action.payload;
      });
  },
});

export const { clearDashboardData, clearError } = userAccountSlice.actions;
export default userAccountSlice.reducer;
