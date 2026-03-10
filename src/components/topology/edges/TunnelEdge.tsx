'use client';

import { memo } from 'react';
import { 
  EdgeProps, 
  getBezierPath, 
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import type { TunnelEdgeData } from '@/types';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

function TunnelEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<TunnelEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isEnabled = data?.enabled ?? true;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isEnabled ? '#f97316' : '#9ca3af',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: '8 4',
        }}
        className={cn(
          'transition-all duration-200',
          isEnabled && 'animate-dash'
        )}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              'flex items-center gap-1 shadow-md',
              'transition-colors',
              isEnabled 
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200',
              selected && 'ring-2 ring-orange-400'
            )}
          >
            <Lock className="w-3 h-3" />
            <span>{data?.tunnelName || 'VPN'}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const TunnelEdge = memo(TunnelEdgeComponent);
