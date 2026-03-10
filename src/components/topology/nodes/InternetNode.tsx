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
        'bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg',
        'min-w-[180px] text-white',
        'transition-all duration-200',
        selected && 'ring-2 ring-blue-300 ring-offset-2'
      )}
    >
      {/* Content */}
      <div className="px-5 py-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-white/20 rounded-full">
            <Cloud className="w-8 h-8" />
          </div>
        </div>
        <h3 className="font-semibold text-lg">{label || 'Internet'}</h3>
        {gateway && (
          <div className="mt-2 flex items-center justify-center gap-1 text-blue-100 text-sm">
            <Globe className="w-3 h-3" />
            <span className="font-mono">{gateway}</span>
          </div>
        )}
      </div>
      
      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="wan"
        className="!bg-white !w-4 !h-4 !border-2 !border-blue-500"
      />
    </div>
  );
}

export const InternetNode = memo(InternetNodeComponent);
