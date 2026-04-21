import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  users: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAllUserData = createAsyncThunk('admin/fetchAllData', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/all-data', { params });
    return data.users;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch user data');
  }
});

export const updateInquiryStatus = createAsyncThunk('admin/updateStatus', async ({ userId, inquiryId, newStatus }, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/admin/update-inquiry-status', { userId, inquiryId, newStatus });
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update status');
  }
});

export const replyToChat = createAsyncThunk('admin/sendReply', async ({ userId, message }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/admin/chat-reply', { userId, message });
    return { userId, chats: data.chats };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to send reply');
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/user/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete user');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateInquiryStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(replyToChat.fulfilled, (state, action) => {
        const user = state.users.find(u => u._id === action.payload.userId);
        if (user) {
          user.chats = action.payload.chats;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
