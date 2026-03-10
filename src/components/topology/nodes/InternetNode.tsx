'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { InternetNodeData } from '@/types';
import { cn } from '@/lib/utils';
import { Cloud, Globe } from 'lucide-react';

function InternetNodeComponent({ data, selected }: NodeProps<InternetNodeData>) {
  const { gateway, label } = data;
  
  return (
    <div
      className={cn(
        'rounded-lg shadow-lg transition-all duration-200',
        'w-[240px] h-[120px]',
        'bg-gradient-to-br from-purple-500 to-indigo-600',
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a3a5f]'
      )}
    >
      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center text-white px-4">
        <div className="p-3 bg-white/20 rounded-full mb-2">
          <Globe className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg">{label || 'Internet'}</h3>
        {gateway && (
          <p className="font-mono text-sm mt-1 bg-white/20 px-3 py-1 rounded-full">
            {gateway}
          </p>
        )}
      </div>
      
      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="wan"
        className="!bg-white !w-4 !h-4 !border-2 !border-purple-500"
      />
    </div>
  );
}

export const InternetNode = memo(InternetNodeComponent);
