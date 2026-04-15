import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, contrasena }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, contrasena);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Credenciales inválidas'
      );
    }
  }
);

const initialState = {
  token: authService.getToken(),
  usuario: authService.getUsuario(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.token = null;
      state.usuario = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.usuario = {
          id: action.payload.id,
          nombre: action.payload.nombre,
          email: action.payload.email,
          rol: action.payload.rol,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
