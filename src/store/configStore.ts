import { create } from 'zustand';
import type { ParseResult } from '@/types';

interface ConfigFile {
  id: string;
  name: string;
  content: string;
  size: number;
  uploadedAt: string;
  parseResult?: ParseResult;
}

interface ConfigState {
  // Uploaded config files
  configFiles: ConfigFile[];
  
  // Actions
  addConfigFile: (file: ConfigFile) => void;
  updateParseResult: (id: string, result: ParseResult) => void;
  removeConfigFile: (id: string) => void;
  clearConfigFiles: () => void;
  getConfigFile: (id: string) => ConfigFile | undefined;
}

export const useConfigStore = create<ConfigState>()((set, get) => ({
  configFiles: [],
  
  addConfigFile: (file) => set((state) => ({
    configFiles: [...state.configFiles, file]
  })),
  
  updateParseResult: (id, result) => set((state) => ({
    configFiles: state.configFiles.map(f =>
      f.id === id ? { ...f, parseResult: result } : f
    )
  })),
  
  removeConfigFile: (id) => set((state) => ({
    configFiles: state.configFiles.filter(f => f.id !== id)
  })),
  
  clearConfigFiles: () => set({ configFiles: [] }),
  
  getConfigFile: (id) => get().configFiles.find(f => f.id === id)
}));
