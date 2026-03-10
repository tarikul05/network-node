'use client';

import { useState } from 'react';
import { 
  Network, 
  Upload, 
  Trash2,
  Map,
  Grid3X3
} from 'lucide-react';
import { ConfigUploader } from '@/components/upload/ConfigUploader';
import { TopologyCanvas } from '@/components/topology/TopologyCanvas';
import { RouterDetailPanel } from '@/components/panels/RouterDetailPanel';
import { useTopologyStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';

// Design spec colors
const CANVAS_BG = '#0a3a5f';
const SITE_BLUE = '#1e88c8';

export default function Home() {
  const [showUploader, setShowUploader] = useState(true);
  const { routers, clearAll } = useTopologyStore();
  const { 
    selectedRouterId,
    showMinimap,
    showGrid,
    toggleMinimap,
    toggleGrid
  } = useUIStore();
  
  const hasTopology = routers.length > 0;

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: CANVAS_BG }}>
      {/* Header */}
      <header 
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ backgroundColor: SITE_BLUE, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Network Topology Viewer
            </h1>
            <p className="text-xs text-white/70">
              Visualize router configurations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View toggles */}
          <button
            onClick={toggleMinimap}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showMinimap 
                ? 'bg-white/30 text-white' 
                : 'text-white/60 hover:bg-white/10'
            )}
            title="Toggle Minimap"
          >
            <Map className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleGrid}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showGrid 
                ? 'bg-white/30 text-white' 
                : 'text-white/60 hover:bg-white/10'
            )}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          {/* Upload toggle */}
          <button
            onClick={() => setShowUploader(!showUploader)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              showUploader
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            )}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          
          {/* Clear all */}
          {hasTopology && (
            <button
              onClick={() => {
                if (confirm('Clear all routers and start fresh?')) {
                  clearAll();
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Upload panel */}
        {showUploader && (
          <aside 
            className="w-80 flex flex-col border-r"
            style={{ backgroundColor: 'rgba(30, 136, 200, 0.3)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h2 className="font-semibold text-white">Configuration Files</h2>
              <p className="text-xs text-white/60 mt-1">
                Upload router config files to build topology
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ConfigUploader />
            </div>
          </aside>
        )}
        
        {/* Main canvas */}
        <main className="flex-1 flex flex-col">
          {/* Stats bar */}
          {hasTopology && (
            <div 
              className="px-4 py-2 flex items-center gap-6 border-b"
              style={{ backgroundColor: 'rgba(30, 136, 200, 0.5)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/70">Routers:</span>
                <span className="font-semibold text-white">{routers.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/70">Tunnels:</span>
                <span className="font-semibold text-white">
                  {routers.reduce((sum, r) => sum + r.tunnels.length, 0)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/70">Interfaces:</span>
                <span className="font-semibold text-white">
                  {routers.reduce((sum, r) => sum + r.interfaces.length, 0)}
                </span>
              </div>
            </div>
          )}
          
          {/* Topology canvas */}
          <div className="flex-1">
            <TopologyCanvas />
          </div>
        </main>
        
        {/* Right sidebar - Detail panel */}
        {selectedRouterId && (
          <aside 
            className="w-96 border-l"
            style={{ backgroundColor: 'rgba(30, 136, 200, 0.3)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <RouterDetailPanel />
          </aside>
        )}
      </div>
    </div>
  );
}
