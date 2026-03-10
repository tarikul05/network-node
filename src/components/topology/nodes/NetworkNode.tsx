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
        'bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg',
        'min-w-[200px] text-white',
        'transition-all duration-200',
        selected && 'ring-2 ring-green-300 ring-offset-2'
      )}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="router"
        className="!bg-white !w-4 !h-4 !border-2 !border-green-500"
      />
      
      {/* Content */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{label || 'Local Network'}</h3>
            <p className="font-mono text-sm text-green-100">{network}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-green-100 mt-3 pt-2 border-t border-white/20">
          <div className="flex items-center gap-1">
            <Server className="w-3 h-3" />
            <span>{routerCount} router{routerCount !== 1 ? 's' : ''}</span>
          </div>
          {dhcpEnabled && (
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
              <Wifi className="w-3 h-3" />
              <span>DHCP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const NetworkNode = memo(NetworkNodeComponent);
