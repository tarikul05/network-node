'use client';

import { memo } from 'react';
import { 
  EdgeProps, 
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export interface InternetEdgeData {
  publicIp?: string;
  isp?: string;
  type?: 'fiber' | 'dsl' | 'cable' | 'wireless' | 'leased';
}

// Design spec: thin yellow line for internet
const INTERNET_COLOR = '#ffd400';

function InternetEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<InternetEdgeData>) {
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
          stroke: INTERNET_COLOR,
          strokeWidth: selected ? 3 : 2,
        }}
      />
      
      {data?.publicIp && (
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
                'bg-red-600 text-white border border-red-400',
                selected && 'ring-2 ring-red-400'
              )}
            >
              <Globe className="w-3 h-3" />
              <span className="font-mono">{data.publicIp}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const InternetEdge = memo(InternetEdgeComponent);
