import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('eventUser')) || null,
  role: localStorage.getItem('eventRole') || null,
  loading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('eventUser', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    localStorage.setItem('eventRole', data.role);
    return { user: data.user, role: data.role };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/logout');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  } finally {
    localStorage.removeItem('eventUser');
    localStorage.removeItem('token');
    localStorage.removeItem('eventRole');
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
    return rejectWithValue(err.response?.data?.message || err.message || 'Error sending OTP');
  }
});

export const verifySignupOtp = createAsyncThunk('auth/verifySignupOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/verify-otp', { email, otp });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Invalid OTP');
  }
});

export const sendForgotOtp = createAsyncThunk('auth/sendForgotOtp', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/forgot-password', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Error sending OTP');
  }
});

export const verifyForgotOtp = createAsyncThunk('auth/verifyForgotOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/verify-reset-otp', { email, otp });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Invalid OTP');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/reset-password', { email, password });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to reset password');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/profile', userData);
    localStorage.setItem('eventUser', JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Profile update failed');
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
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.loading = false;
        state.error = null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generic loading/error for OTP thunks
      .addCase(sendSignupOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendSignupOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(sendSignupOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verifySignupOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifySignupOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(verifySignupOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(sendForgotOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendForgotOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(sendForgotOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verifyForgotOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyForgotOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(verifyForgotOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;