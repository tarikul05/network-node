'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Cloud, Server, Globe } from 'lucide-react';

export interface CloudNodeData {
  title: string;
  description?: string;
  type: 'aws' | 'azure' | 'gcp' | 'salesforce' | 'datacenter' | 'isp' | 'generic';
  ipAddress?: string;
}

const cloudIcons = {
  aws: '☁️',
  azure: '⬡',
  gcp: '◈',
  salesforce: '☁',
  datacenter: '🏢',
  isp: '🌐',
  generic: '☁️',
};

const cloudColors = {
  aws: 'from-orange-400 to-orange-500',
  azure: 'from-blue-400 to-blue-500',
  gcp: 'from-red-400 to-yellow-400',
  salesforce: 'from-sky-400 to-sky-500',
  datacenter: 'from-slate-500 to-slate-600',
  isp: 'from-purple-400 to-purple-500',
  generic: 'from-gray-400 to-gray-500',
};

function CloudNodeComponent({ data, selected }: NodeProps<CloudNodeData>) {
  const { title, description, type = 'generic', ipAddress } = data;
  
  return (
    <div
      className={cn(
        'rounded-lg shadow-lg transition-all duration-200',
        'w-[240px] h-[120px]',
        `bg-gradient-to-br ${cloudColors[type]}`,
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a3a5f]'
      )}
    >
      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center text-white px-4">
        <div className="text-3xl mb-1">{cloudIcons[type]}</div>
        <h3 className="font-bold text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-white/80">{description}</p>
        )}
        {ipAddress && (
          <p className="font-mono text-sm mt-1 bg-white/20 px-2 py-0.5 rounded">
            {ipAddress}
          </p>
        )}
      </div>
      
      {/* Bottom handle for connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="main"
        className="!bg-white !w-4 !h-4 !border-2 !border-gray-400"
      />
    </div>
  );
}

export const CloudNode = memo(CloudNodeComponent);
