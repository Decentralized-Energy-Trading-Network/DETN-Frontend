import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateEnergyBalance: (state, action) => {
      if (state.user) {
        state.user.energyBalance = action.payload;
      }
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateEnergyBalance 
} = authSlice.actions;

export default authSlice.reducer;