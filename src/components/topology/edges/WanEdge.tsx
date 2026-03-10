'use client';

import { memo } from 'react';
import { 
  EdgeProps, 
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import type { WanEdgeData } from '@/types';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

function WanEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<WanEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: '#3b82f6',
          strokeWidth: selected ? 4 : 3,
        }}
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
              'bg-blue-100 text-blue-700 border border-blue-200',
              selected && 'ring-2 ring-blue-400'
            )}
          >
            <Globe className="w-3 h-3" />
            <span>{data?.publicIp || 'WAN'}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const WanEdge = memo(WanEdgeComponent);
