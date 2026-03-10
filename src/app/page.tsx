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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Network Topology Viewer
            </h1>
            <p className="text-xs text-gray-500">
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
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:bg-gray-100'
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
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:bg-gray-100'
            )}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-2" />
          
          {/* Upload toggle */}
          <button
            onClick={() => setShowUploader(!showUploader)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              showUploader
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
          <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Configuration Files</h2>
              <p className="text-xs text-gray-500 mt-1">
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
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Routers:</span>
                <span className="font-semibold text-gray-900">{routers.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Tunnels:</span>
                <span className="font-semibold text-gray-900">
                  {routers.reduce((sum, r) => sum + r.tunnels.length, 0)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Interfaces:</span>
                <span className="font-semibold text-gray-900">
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
          <aside className="w-96">
            <RouterDetailPanel />
          </aside>
        )}
      </div>
    </div>
  );
}
