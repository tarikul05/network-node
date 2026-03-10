'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { RemoteRouterNodeData } from '@/types';
import { cn } from '@/lib/utils';
import { Server, Upload, Globe } from 'lucide-react';

function RemoteRouterNodeComponent({ data, selected }: NodeProps<RemoteRouterNodeData>) {
  const { peer, tunnelName } = data;
  
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md min-w-[200px]',
        'border-2 border-dashed',
        'transition-all duration-200',
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'
      )}
    >
      {/* Top handle for tunnel connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="tunnel"
        className="!bg-orange-500 !w-3 !h-3"
      />
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-dashed border-gray-200 bg-gray-50/50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Server className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-700 truncate">
              {tunnelName || 'Remote Router'}
            </h3>
            <p className="text-xs text-gray-400">Unknown Device</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="text-gray-500">Public IP:</span>
          <span className="font-mono text-gray-700">{peer.publicIp}</span>
        </div>
        
        {peer.targetNetworks.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">Networks:</span>
            <div className="mt-1 space-y-1">
              {peer.targetNetworks.map((network, i) => (
                <div 
                  key={i}
                  className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600"
                >
                  {network}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload prompt */}
        <button
          className={cn(
            'w-full mt-2 py-2 px-3 rounded-md text-sm',
            'bg-blue-50 text-blue-600 hover:bg-blue-100',
            'flex items-center justify-center gap-2',
            'transition-colors'
          )}
        >
          <Upload className="w-4 h-4" />
          Upload Config
        </button>
      </div>
      
      {/* Bottom handle for potential LAN */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="lan"
        className="!bg-green-500 !w-3 !h-3 !opacity-50"
      />
    </div>
  );
}

export const RemoteRouterNode = memo(RemoteRouterNodeComponent);
