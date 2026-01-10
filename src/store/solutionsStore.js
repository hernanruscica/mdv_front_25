import { create } from 'zustand';
import solutionsService from '../services/solutionsService';

export const useSolutionsStore = create((set) => ({
  solutions: [],
  selectedSolution: null,
  error: null,
  loadingStates: {
    fetchSolutions: false,
    createSolution: false,
  },

  // Crear una nueva solución
  createSolution: async (businessUuid, solutionData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createSolution: true },
      error: null,
    }));

    try {
      // 1. Obtenemos la respuesta completa del backend (incluye success, message, item)
      const response = await solutionsService.createSolution(businessUuid, solutionData);
      
      // 2. Extraemos la solución real. Si viene en 'response.item', usamos eso.
      // Si por alguna razón el servicio devuelve directo el objeto, usamos response.
      const actualSolution = response; 

      set((state) => ({
        // 3. Guardamos SOLO el objeto de la solución en el array
        solutions: [...state.solutions, actualSolution],
        loadingStates: { ...state.loadingStates, createSolution: false },
      }));

      // 4. RETORNAMOS la respuesta COMPLETA. 
      // Esto es vital para que tu Modal pueda leer "response.success" y "response.item"
      return response; 
      
    } catch (error) {
      set((state) => ({
        error: error.message || 'Error al crear la solución',
        loadingStates: { ...state.loadingStates, createSolution: false },
      }));
      throw error;
    }
  },

  // ... el resto de tus funciones (fetchSolutionsByAlarmLogId, etc.) se ven bien.
  fetchSolutionsByAlarmLogId: async (businessUuid, alarmLogId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchSolutions: true },
      error: null,
    }));

    try {
      const solutions = await solutionsService.getSolutionsByAlarmLogId(businessUuid, alarmLogId);
      set((state) => ({
        solutions: solutions,
        loadingStates: { ...state.loadingStates, fetchSolutions: false },
      }));
      return solutions;
    } catch (error) {
      set((state) => ({
        error: error.message || 'Error al obtener las soluciones',
        loadingStates: { ...state.loadingStates, fetchSolutions: false },
      }));
      throw error;
    }
  },

  // ... resto del código
  fetchSolutionsByUserId: async (userId) => {
    // ... (código existente)
  },

  clearSolutions: () => {
    set({
      solutions: [],
      selectedSolution: null,
      error: null,
    });
  },
}));