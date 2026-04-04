import { GameState } from '../types';

const SAVE_KEY = 'pixel_dorm_valley_save';

export const storageService = {
  saveGame: (state: GameState) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, serializedState);
      return true;
    } catch (err) {
      console.error('Failed to save game:', err);
      return false;
    }
  },

  loadGame: (): GameState | null => {
    try {
      const serializedState = localStorage.getItem(SAVE_KEY);
      if (serializedState === null) return null;
      return JSON.parse(serializedState) as GameState;
    } catch (err) {
      console.error('Failed to load game:', err);
      return null;
    }
  },

  clearSave: () => {
    localStorage.removeItem(SAVE_KEY);
  }
};
