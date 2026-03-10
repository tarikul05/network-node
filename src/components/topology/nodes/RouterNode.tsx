'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { RouterNodeData } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Router, 
  Wifi, 
  Globe, 
  Network, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Design spec colors
const COLORS = {
  router: '#f2c94c',      // Yellow router
  routerDark: '#d4a62a',  // Darker yellow for borders
  wanIp: '#ff6b6b',       // Red for WAN IP
  lanNetwork: '#22c55e',  // Green for LAN
  tunnel: '#f97316',      // Orange for tunnels
};

function RouterNodeComponent({ data, selected }: NodeProps<RouterNodeData>) {
  const { router, isHighlighted } = data;
  const tunnelCount = router.tunnels.length;
  const enabledTunnels = router.tunnels.filter(t => t.enabled).length;
  
  // Find WAN and LAN interfaces
  const wanInterface = router.interfaces.find(i => i.type === 'wan');
  const lanInterfaces = router.interfaces.filter(i => i.type === 'lan');
  const primaryLan = lanInterfaces[0];
  
  // Get model from firmware
  const modelMatch = router.firmware?.match(/RTX\d+|NVR\d+|FWX\d+|SRT\d+/i);
  const model = modelMatch ? modelMatch[0] : 'Router';
  
  return (
    <div
      className={cn(
        'rounded-lg shadow-lg transition-all duration-200',
        'w-[160px]',
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a3a5f]',
        isHighlighted && 'ring-2 ring-white'
      )}
      style={{ 
        backgroundColor: COLORS.router,
        border: `2px solid ${COLORS.routerDark}`
      }}
    >
      {/* Top handles for tunnel connections */}
      {router.tunnels.slice(0, 5).map((tunnel, i) => (
        <Handle
          key={`tunnel-${tunnel.id}`}
          type="source"
          position={Position.Top}
          id={`tunnel-${tunnel.id}`}
          className="!w-2.5 !h-2.5 !border-0"
          style={{ 
            left: `${((i + 1) / (Math.min(router.tunnels.length, 5) + 1)) * 100}%`,
            backgroundColor: COLORS.tunnel
          }}
        />
      ))}
      
      {/* Left handle for WAN */}
      <Handle
        type="target"
        position={Position.Left}
        id="wan"
        className="!w-2.5 !h-2.5 !border-0"
        style={{ backgroundColor: COLORS.wanIp }}
      />
      
      {/* Header - Hostname / Role */}
      <div className="px-3 py-2 border-b border-yellow-600/30">
        <h3 className="font-bold text-gray-900 text-sm truncate">
          {router.hostname}
        </h3>
      </div>
      
      {/* Body - Model & LAN */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-xs font-medium text-gray-700">
          {model}
        </div>
        {primaryLan && (
          <div className="font-mono text-xs text-gray-800">
            {primaryLan.ipAddress}/{primaryLan.cidr}
          </div>
        )}
      </div>
      
      {/* Footer - WAN IP */}
      {wanInterface && (
        <div 
          className="px-3 py-1.5 rounded-b-md font-mono text-xs text-white text-center"
          style={{ backgroundColor: COLORS.wanIp }}
        >
          {wanInterface.ipAddress}/{wanInterface.cidr}
        </div>
      )}
      
      {/* Bottom handles for LAN connections */}
      {lanInterfaces.slice(0, 3).map((iface, i) => (
        <Handle
          key={iface.id}
          type="source"
          position={Position.Bottom}
          id={iface.id}
          className="!w-2.5 !h-2.5 !border-0"
          style={{ 
            left: `${((i + 1) / (Math.min(lanInterfaces.length, 3) + 1)) * 100}%`,
            backgroundColor: COLORS.lanNetwork
          }}
        />
      ))}
    </div>
  );
}

export const RouterNode = memo(RouterNodeComponent);
