'use client';

import { memo } from 'react';
import { 
  EdgeProps, 
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import { cn } from '@/lib/utils';

export interface BackboneEdgeData {
  label?: string;
  bandwidth?: string;
  isRedundant?: boolean;
}

// Design spec: thick yellow line for backbone
const BACKBONE_COLOR = '#ffd400';

function BackboneEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<BackboneEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  return (
    <>
      {/* Shadow/glow effect */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: BACKBONE_COLOR,
          strokeWidth: selected ? 8 : 6,
          strokeOpacity: 0.3,
          filter: 'blur(4px)',
        }}
      />
      
      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: BACKBONE_COLOR,
          strokeWidth: selected ? 5 : 4,
        }}
      />
      
      {data?.label && (
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
                'bg-yellow-900 text-yellow-100 border border-yellow-600',
                selected && 'ring-2 ring-yellow-400'
              )}
            >
              {data.label}
              {data.bandwidth && (
                <span className="ml-1 text-yellow-300">({data.bandwidth})</span>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const BackboneEdge = memo(BackboneEdgeComponent);
