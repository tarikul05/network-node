'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { RemoteRouterNodeData } from '@/types';
import { cn } from '@/lib/utils';
import { Server, Upload, Globe, HelpCircle } from 'lucide-react';

// Design spec colors (same as RouterNode)
const COLORS = {
  router: '#f2c94c',      // Yellow router
  routerDark: '#d4a62a',  // Darker yellow for borders
  wanIp: '#ff6b6b',       // Red for WAN IP
  unknown: '#9ca3af',     // Gray for unknown devices
  unknownDark: '#6b7280', // Darker gray
  tunnel: '#f97316',      // Orange for tunnels
};

function RemoteRouterNodeComponent({ data, selected }: NodeProps<RemoteRouterNodeData>) {
  const { peer, tunnelName } = data;
  
  return (
    <div
      className={cn(
        'rounded-lg shadow-lg transition-all duration-200',
        'w-[160px]',
        'border-2 border-dashed',
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a3a5f]'
      )}
      style={{ 
        backgroundColor: COLORS.unknown,
        borderColor: COLORS.unknownDark
      }}
    >
      {/* Top handle for tunnel connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="tunnel"
        className="!w-2.5 !h-2.5 !border-0"
        style={{ backgroundColor: COLORS.tunnel }}
      />
      
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-500/30">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-gray-700" />
          <h3 className="font-bold text-gray-900 text-sm truncate">
            {tunnelName || 'Remote'}
          </h3>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-xs font-medium text-gray-700">
          Unknown Device
        </div>
        <div className="font-mono text-xs text-gray-800">
          {peer.publicIp}
        </div>
      </div>
      
      {/* Target networks */}
      {peer.targetNetworks.length > 0 && (
        <div 
          className="px-3 py-1.5 bg-gray-600/30 text-xs text-gray-800"
        >
          {peer.targetNetworks.slice(0, 2).map((net, i) => (
            <div key={i} className="font-mono truncate">{net}</div>
          ))}
          {peer.targetNetworks.length > 2 && (
            <div className="text-gray-600">+{peer.targetNetworks.length - 2} more</div>
          )}
        </div>
      )}
      
      {/* Upload button */}
      <button
        className={cn(
          'w-full py-1.5 px-3 rounded-b-md text-xs',
          'bg-blue-500 text-white hover:bg-blue-600',
          'flex items-center justify-center gap-1',
          'transition-colors'
        )}
      >
        <Upload className="w-3 h-3" />
        Upload Config
      </button>
      
      {/* Bottom handle for potential LAN */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="lan"
        className="!w-2.5 !h-2.5 !border-0 !opacity-50"
        style={{ backgroundColor: '#22c55e' }}
      />
    </div>
  );
}

export const RemoteRouterNode = memo(RemoteRouterNodeComponent);
