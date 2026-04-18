import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('eventUser')) || null,
  loading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('eventUser', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/logout');
    localStorage.removeItem('eventUser');
    localStorage.removeItem('token');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const sendSignupOtp = createAsyncThunk('auth/sendSignupOtp', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/send-otp', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error sending OTP');
  }
});

export const verifySignupOtp = createAsyncThunk('auth/verifySignupOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/verify-otp', { email, otp });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
  }
});

export const sendForgotOtp = createAsyncThunk('auth/sendForgotOtp', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/send-forgot-otp', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error sending OTP');
  }
});

export const verifyForgotOtp = createAsyncThunk('auth/verifyForgotOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/verify-forgot-otp', { email, otp });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/reset-password', { email, password });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reset password');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // Generic loading and error handling for other thunks if needed
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
