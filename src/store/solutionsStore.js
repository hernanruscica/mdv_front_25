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
  createSolution: async (solutionData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, createSolution: true },
      error: null,
    }));

    try {
      const newSolution = await solutionsService.createSolution(solutionData);
      set((state) => ({
        solutions: [...state.solutions, newSolution],
        loadingStates: { ...state.loadingStates, createSolution: false },
      }));
      return newSolution;
    } catch (error) {
      set((state) => ({
        error: error.message || 'Error al crear la solución',
        loadingStates: { ...state.loadingStates, createSolution: false },
      }));
      throw error;
    }
  },

  // Obtener soluciones por ID de log de alarma
  fetchSolutionsByAlarmLogId: async (alarmLogId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchSolutions: true },
      error: null,
    }));

    try {
      const solutions = await solutionsService.getSolutionsByAlarmLogId(alarmLogId);
      set((state) => ({
        solutions: solutions.solutions,
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

  // Obtener soluciones por ID de usuario
  fetchSolutionsByUserId: async (userId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchSolutions: true },
      error: null,
    }));

    try {
      const solutions = await solutionsService.getSolutionsByUserId(userId);
      set((state) => ({
        solutions: solutions.solutions,
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

  // Limpiar el estado
  clearSolutions: () => {
    set({
      solutions: [],
      selectedSolution: null,
      error: null,
    });
  },
})); 