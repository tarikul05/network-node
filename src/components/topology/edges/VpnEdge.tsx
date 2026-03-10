'use client';

import { memo } from 'react';
import { 
  EdgeProps, 
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export interface VpnEdgeData {
  tunnelName?: string;
  localIp?: string;
  remoteIp?: string;
  encryption?: string;
  enabled?: boolean;
}

// Design spec: dashed line for VPN tunnels
const VPN_COLOR_ENABLED = '#f97316';  // Orange
const VPN_COLOR_DISABLED = '#6b7280'; // Gray

function VpnEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<VpnEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isEnabled = data?.enabled ?? true;
  const color = isEnabled ? VPN_COLOR_ENABLED : VPN_COLOR_DISABLED;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: '8 4',
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
              'px-2 py-1 rounded-full text-xs font-medium shadow-md',
              'flex items-center gap-1',
              isEnabled 
                ? 'bg-orange-900 text-orange-100 border border-orange-600'
                : 'bg-gray-700 text-gray-300 border border-gray-500',
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

export const VpnEdge = memo(VpnEdgeComponent);
