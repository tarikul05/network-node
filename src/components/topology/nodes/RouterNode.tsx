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

function RouterNodeComponent({ data, selected }: NodeProps<RouterNodeData>) {
  const { router, isHighlighted } = data;
  const tunnelCount = router.tunnels.length;
  const enabledTunnels = router.tunnels.filter(t => t.enabled).length;
  
  // Find WAN and LAN interfaces
  const wanInterface = router.interfaces.find(i => i.type === 'wan');
  const lanInterfaces = router.interfaces.filter(i => i.type === 'lan');
  
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg border-2 min-w-[280px]',
        'transition-all duration-200',
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200',
        isHighlighted && 'ring-2 ring-yellow-400'
      )}
    >
      {/* Top handles for tunnel connections */}
      {router.tunnels.map((tunnel, i) => (
        <Handle
          key={`tunnel-${tunnel.id}`}
          type="source"
          position={Position.Top}
          id={`tunnel-${tunnel.id}`}
          className="!bg-orange-500 !w-3 !h-3"
          style={{ 
            left: `${((i + 1) / (router.tunnels.length + 1)) * 100}%` 
          }}
        />
      ))}
      
      {/* Left handle for WAN */}
      {wanInterface && (
        <Handle
          type="target"
          position={Position.Left}
          id="wan"
          className="!bg-blue-500 !w-3 !h-3"
        />
      )}
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Router className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {router.hostname}
            </h3>
            {router.serial && (
              <p className="text-xs text-gray-500">S/N: {router.serial}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Status & Info */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            Online
          </span>
        </div>
        {router.firmware && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Firmware</span>
            <span className="text-gray-700">{router.firmware}</span>
          </div>
        )}
      </div>
      
      {/* Interfaces */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Interfaces
        </div>
        <div className="space-y-1">
          {router.interfaces.slice(0, 4).map((iface) => (
            <div 
              key={iface.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                {iface.type === 'wan' ? (
                  <Globe className="w-3 h-3 text-blue-500" />
                ) : (
                  <Network className="w-3 h-3 text-green-500" />
                )}
                <span className="text-gray-600">{iface.name}</span>
              </div>
              <span className="text-gray-800 font-mono text-xs">
                {iface.ipAddress}/{iface.cidr}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tunnels Summary */}
      {tunnelCount > 0 && (
        <div className="px-4 py-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            VPN Tunnels
          </div>
          <div className="space-y-1">
            {router.tunnels.slice(0, 3).map((tunnel) => (
              <div 
                key={tunnel.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="w-3 h-3 text-orange-500" />
                  <span className="text-gray-600 truncate max-w-[120px]">
                    {tunnel.name || `Tunnel ${tunnel.id}`}
                  </span>
                </div>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  tunnel.enabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {tunnel.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
            {tunnelCount > 3 && (
              <div className="text-xs text-gray-400 text-center">
                +{tunnelCount - 3} more tunnels
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bottom handles for LAN connections */}
      {lanInterfaces.map((iface, i) => (
        <Handle
          key={iface.id}
          type="source"
          position={Position.Bottom}
          id={iface.id}
          className="!bg-green-500 !w-3 !h-3"
          style={{ 
            left: `${((i + 1) / (lanInterfaces.length + 1)) * 100}%` 
          }}
        />
      ))}
    </div>
  );
}

export const RouterNode = memo(RouterNodeComponent);
