import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pagosService } from '../services/pagosService';

export const fetchPagos = createAsyncThunk(
  'pagos/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await pagosService.buscar(filtros);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al cargar pagos');
    }
  }
);

export const actualizarPago = createAsyncThunk(
  'pagos/actualizar',
  async ({ pago, cbu }, { rejectWithValue }) => {
    try {
      return await pagosService.actualizarCbu(pago, cbu);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al actualizar');
    }
  }
);

export const importarPagos = createAsyncThunk(
  'pagos/importar',
  async (archivo, { rejectWithValue }) => {
    try {
      return await pagosService.importar(archivo);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al importar');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  filtros: {
    banco: '',
    estado: '',
  },
  seleccionados: [],
  lastImport: null,
};

const pagosSlice = createSlice({
  name: 'pagos',
  initialState,
  reducers: {
    setFiltro: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
    },
    toggleSeleccion: (state, action) => {
      const id = action.payload;
      if (state.seleccionados.includes(id)) {
        state.seleccionados = state.seleccionados.filter((x) => x !== id);
      } else {
        state.seleccionados.push(id);
      }
    },
    seleccionarTodos: (state, action) => {
      state.seleccionados = action.payload;
    },
    limpiarSeleccion: (state) => {
      state.seleccionados = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPagos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPagos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPagos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(actualizarPago.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(importarPagos.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastImport = null;
      })
      .addCase(importarPagos.fulfilled, (state, action) => {
        state.loading = false;
        state.lastImport = action.payload;
      })
      .addCase(importarPagos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFiltro,
  toggleSeleccion,
  seleccionarTodos,
  limpiarSeleccion,
} = pagosSlice.actions;
export default pagosSlice.reducer;
