'use client';

import { useTopologyStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  X, 
  Router, 
  Globe, 
  Network, 
  Wifi, 
  Server,
  Settings,
  ChevronRight
} from 'lucide-react';

export function RouterDetailPanel() {
  const { routers } = useTopologyStore();
  const { selectedRouterId, selectRouter } = useUIStore();
  
  const router = routers.find(r => r.id === selectedRouterId);
  
  if (!router) return null;
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Router className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{router.hostname}</h2>
            <p className="text-xs text-gray-500">{router.model}</p>
          </div>
        </div>
        <button
          onClick={() => selectRouter(null)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Basic Info */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Device Information
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Serial Number</dt>
              <dd className="text-sm font-mono text-gray-900">{router.serial || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Firmware</dt>
              <dd className="text-sm text-gray-900">{router.firmware || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Memory</dt>
              <dd className="text-sm text-gray-900">{router.metadata.memory || 'N/A'}</dd>
            </div>
          </dl>
        </div>
        
        {/* Interfaces */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Interfaces ({router.interfaces.length})
          </h3>
          <div className="space-y-2">
            {router.interfaces.map((iface) => (
              <div
                key={iface.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {iface.type === 'wan' ? (
                      <Globe className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Network className="w-4 h-4 text-green-500" />
                    )}
                    <span className="font-medium text-gray-900">{iface.name}</span>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    iface.type === 'wan' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  )}>
                    {iface.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-600">
                  {iface.ipAddress}/{iface.cidr}
                </div>
                {iface.network && (
                  <div className="text-xs text-gray-400 mt-1">
                    Network: {iface.network}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Tunnels */}
        {router.tunnels.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              VPN Tunnels ({router.tunnels.length})
            </h3>
            <div className="space-y-2">
              {router.tunnels.map((tunnel) => (
                <div
                  key={tunnel.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-900">
                        {tunnel.name || `Tunnel ${tunnel.id}`}
                      </span>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      tunnel.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {tunnel.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">Remote:</span>
                      <span className="font-mono">{tunnel.remoteAddress}</span>
                    </div>
                    {tunnel.targetNetworks.length > 0 && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <span className="text-gray-400">Networks:</span>
                        <div className="flex flex-wrap gap-1">
                          {tunnel.targetNetworks.map((net, i) => (
                            <span
                              key={i}
                              className="font-mono text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded"
                            >
                              {net}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Services */}
        <div className="p-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Services
          </h3>
          <div className="space-y-2">
            {router.services.dhcp && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">DHCP Server</span>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  router.services.dhcp.enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {router.services.dhcp.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            )}
            {router.services.dns && (
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">DNS Servers</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {router.services.dns.servers.map((server, i) => (
                    <span
                      key={i}
                      className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                    >
                      {server}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
