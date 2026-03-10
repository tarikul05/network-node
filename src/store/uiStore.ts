import { create } from 'zustand';
import type { LayoutType } from '@/types';

type PanelType = 'router' | 'connection' | 'site' | 'export' | null;

interface UIState {
  // Panel state
  selectedRouterId: string | null;
  selectedConnectionId: string | null;
  activePanelType: PanelType;
  sidebarOpen: boolean;
  
  // Canvas state
  zoomLevel: number;
  fitViewOnLoad: boolean;
  showMinimap: boolean;
  showGrid: boolean;
  
  // Layout
  layoutType: LayoutType;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  selectRouter: (id: string | null) => void;
  selectConnection: (id: string | null) => void;
  setActivePanel: (panel: PanelType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  setZoomLevel: (level: number) => void;
  setFitViewOnLoad: (fit: boolean) => void;
  toggleMinimap: () => void;
  toggleGrid: () => void;
  setLayoutType: (type: LayoutType) => void;
  
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  selectedRouterId: null,
  selectedConnectionId: null,
  activePanelType: null,
  sidebarOpen: true,
  
  zoomLevel: 1,
  fitViewOnLoad: true,
  showMinimap: true,
  showGrid: true,
  
  layoutType: 'hierarchical',
  
  isUploading: false,
  uploadProgress: 0,
  
  // Actions
  selectRouter: (id) => set({ 
    selectedRouterId: id,
    selectedConnectionId: null,
    activePanelType: id ? 'router' : null
  }),
  
  selectConnection: (id) => set({ 
    selectedConnectionId: id,
    selectedRouterId: null,
    activePanelType: id ? 'connection' : null
  }),
  
  setActivePanel: (panel) => set({ activePanelType: panel }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setFitViewOnLoad: (fit) => set({ fitViewOnLoad: fit }),
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setLayoutType: (type) => set({ layoutType: type }),
  
  setUploading: (uploading) => set({ isUploading: uploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress })
}));
