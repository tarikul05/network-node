import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Router, Site, Connection, UnknownPeer, NetworkTopology } from '@/types';

interface TopologyState {
  // Data
  routers: Router[];
  sites: Site[];
  connections: Connection[];
  unknownPeers: UnknownPeer[];
  
  // Actions - Routers
  addRouter: (router: Router) => void;
  updateRouter: (id: string, updates: Partial<Router>) => void;
  removeRouter: (id: string) => void;
  
  // Actions - Sites
  addSite: (site: Site) => void;
  updateSite: (id: string, updates: Partial<Site>) => void;
  removeSite: (id: string) => void;
  assignRouterToSite: (routerId: string, siteId: string) => void;
  
  // Actions - Connections
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  
  // Actions - Unknown Peers
  setUnknownPeers: (peers: UnknownPeer[]) => void;
  
  // Actions - Bulk
  clearAll: () => void;
  importTopology: (topology: NetworkTopology) => void;
  exportTopology: () => NetworkTopology;
}

export const useTopologyStore = create<TopologyState>()(
  persist(
    (set, get) => ({
      // Initial state
      routers: [],
      sites: [],
      connections: [],
      unknownPeers: [],
      
      // Router actions
      addRouter: (router) => set((state) => ({
        routers: [...state.routers.filter(r => r.id !== router.id), router]
      })),
      
      updateRouter: (id, updates) => set((state) => ({
        routers: state.routers.map(r => 
          r.id === id ? { ...r, ...updates } : r
        )
      })),
      
      removeRouter: (id) => set((state) => ({
        routers: state.routers.filter(r => r.id !== id),
        connections: state.connections.filter(
          c => c.sourceRouterId !== id && c.targetRouterId !== id
        )
      })),
      
      // Site actions
      addSite: (site) => set((state) => ({
        sites: [...state.sites, site]
      })),
      
      updateSite: (id, updates) => set((state) => ({
        sites: state.sites.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      removeSite: (id) => set((state) => ({
        sites: state.sites.filter(s => s.id !== id),
        routers: state.routers.map(r => 
          r.siteId === id ? { ...r, siteId: undefined } : r
        )
      })),
      
      assignRouterToSite: (routerId, siteId) => set((state) => ({
        routers: state.routers.map(r => 
          r.id === routerId ? { ...r, siteId } : r
        ),
        sites: state.sites.map(s => 
          s.id === siteId 
            ? { ...s, routers: [...new Set([...s.routers, routerId])] }
            : { ...s, routers: s.routers.filter(id => id !== routerId) }
        )
      })),
      
      // Connection actions
      setConnections: (connections) => set({ connections }),
      
      addConnection: (connection) => set((state) => ({
        connections: [...state.connections, connection]
      })),
      
      // Unknown peers
      setUnknownPeers: (peers) => set({ unknownPeers: peers }),
      
      // Bulk actions
      clearAll: () => set({
        routers: [],
        sites: [],
        connections: [],
        unknownPeers: []
      }),
      
      importTopology: (topology) => set({
        routers: topology.routers,
        sites: topology.sites,
        connections: topology.connections,
        unknownPeers: topology.unknownPeers
      }),
      
      exportTopology: () => {
        const state = get();
        return {
          routers: state.routers,
          sites: state.sites,
          connections: state.connections,
          unknownPeers: state.unknownPeers,
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
          }
        };
      }
    }),
    {
      name: 'network-topology-storage'
    }
  )
);
