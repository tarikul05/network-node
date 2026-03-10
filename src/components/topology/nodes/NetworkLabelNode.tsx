'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';

export interface NetworkLabelNodeData {
  network: string;
  cidr?: number;
  label?: string;
  type: 'lan' | 'wan' | 'dmz' | 'management';
}

const typeColors = {
  lan: 'bg-green-500/80 border-green-400',
  wan: 'bg-red-500/80 border-red-400',
  dmz: 'bg-yellow-500/80 border-yellow-400',
  management: 'bg-purple-500/80 border-purple-400',
};

const textColors = {
  lan: 'text-green-100',
  wan: 'text-red-100',
  dmz: 'text-yellow-100',
  management: 'text-purple-100',
};

function NetworkLabelNodeComponent({ data, selected }: NodeProps<NetworkLabelNodeData>) {
  const { network, cidr, label, type = 'lan' } = data;
  
  const displayText = cidr ? `${network}/${cidr}` : network;
  
  return (
    <div
      className={cn(
        'rounded-full px-4 py-2 border-2 shadow-md transition-all duration-200',
        typeColors[type],
        selected && 'ring-2 ring-white'
      )}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="!bg-white !w-3 !h-3 !border-2 !border-gray-400"
      />
      
      <div className="text-center">
        {label && (
          <p className={cn('text-xs font-medium', textColors[type])}>
            {label}
          </p>
        )}
        <p className={cn('font-mono text-sm font-bold text-white')}>
          {displayText}
        </p>
      </div>
      
      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="!bg-white !w-3 !h-3 !border-2 !border-gray-400"
      />
    </div>
  );
}

export const NetworkLabelNode = memo(NetworkLabelNodeComponent);
