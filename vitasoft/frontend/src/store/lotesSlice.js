import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { lotesService } from '../services/lotesService';

export const fetchLotes = createAsyncThunk(
  'lotes/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await lotesService.listar();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al cargar lotes');
    }
  }
);

export const procesarLote = createAsyncThunk(
  'lotes/procesar',
  async ({ banco, pagoIds }, { rejectWithValue }) => {
    try {
      return await lotesService.procesar(banco, pagoIds);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al procesar lote');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  ultimoLote: null,
};

const lotesSlice = createSlice({
  name: 'lotes',
  initialState,
  reducers: {
    clearUltimoLote: (state) => {
      state.ultimoLote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLotes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(procesarLote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(procesarLote.fulfilled, (state, action) => {
        state.loading = false;
        state.ultimoLote = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(procesarLote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUltimoLote } = lotesSlice.actions;
export default lotesSlice.reducer;
