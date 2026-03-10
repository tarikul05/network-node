'use client';

import { memo } from 'react';
import { 
  EdgeProps, 
  getStraightPath,
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import type { LanEdgeData } from '@/types';
import { cn } from '@/lib/utils';
import { Network } from 'lucide-react';

function LanEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<LanEdgeData>) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: '#22c55e',
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
              'bg-green-100 text-green-700 border border-green-200',
              selected && 'ring-2 ring-green-400'
            )}
          >
            <Network className="w-3 h-3" />
            <span>{data?.network || 'LAN'}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const LanEdge = memo(LanEdgeComponent);
