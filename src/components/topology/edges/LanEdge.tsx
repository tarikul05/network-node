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

const LAN_COLOR = '#22c55e';

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
          stroke: LAN_COLOR,
          strokeWidth: selected ? 4 : 3,
        }}
      />
      
      {data?.network && (
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
                'px-2 py-1 rounded text-xs font-medium shadow-md',
                'flex items-center gap-1',
                'bg-green-700 text-green-100 border border-green-500',
                selected && 'ring-2 ring-green-400'
              )}
            >
              <Network className="w-3 h-3" />
              <span className="font-mono">{data.network}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const LanEdge = memo(LanEdgeComponent);
