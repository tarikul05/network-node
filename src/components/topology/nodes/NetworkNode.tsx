'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NetworkNodeData } from '@/types';
import { cn } from '@/lib/utils';
import { Network, Server, Wifi } from 'lucide-react';

function NetworkNodeComponent({ data, selected }: NodeProps<NetworkNodeData>) {
  const { network, cidr, routerCount, dhcpEnabled, label } = data;
  
  return (
    <div
      className={cn(
        'rounded-lg shadow-lg transition-all duration-200',
        'min-w-[160px]',
        'bg-gradient-to-br from-emerald-500 to-green-600',
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a3a5f]'
      )}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="router"
        className="!bg-white !w-3 !h-3 !border-2 !border-green-500"
      />
      
      {/* Content */}
      <div className="px-4 py-3 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-5 h-5" />
          <span className="text-sm font-medium">{label || 'LAN'}</span>
        </div>
        
        <div className="font-mono text-sm font-bold">
          {network}/{cidr}
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-green-100">
          <Server className="w-3 h-3" />
          <span>{routerCount} router{routerCount !== 1 ? 's' : ''}</span>
          {dhcpEnabled && (
            <span className="ml-auto flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
              <Wifi className="w-3 h-3" />
              DHCP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const NetworkNode = memo(NetworkNodeComponent);
