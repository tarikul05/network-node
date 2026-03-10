'use client';

import { memo } from 'react';
import { type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Building2, MapPin } from 'lucide-react';

export interface SiteNodeData {
  siteName: string;
  siteNameJa?: string; // Japanese site name
  routerCount: number;
  tier: 'core' | 'regional' | 'branch';
  location?: string;
}

const tierColors = {
  core: {
    bg: 'bg-[#b0522c]/90',
    border: 'border-[#d4714a]',
    text: 'text-orange-100',
  },
  regional: {
    bg: 'bg-[#1e88c8]/90',
    border: 'border-[#4aa3d8]',
    text: 'text-blue-100',
  },
  branch: {
    bg: 'bg-[#1e88c8]/70',
    border: 'border-[#4aa3d8]',
    text: 'text-blue-100',
  },
};

function SiteNodeComponent({ data, selected }: NodeProps<SiteNodeData>) {
  const { siteName, siteNameJa, routerCount, tier = 'branch', location } = data;
  const colors = tierColors[tier];
  
  return (
    <div
      className={cn(
        'rounded-lg border-2 transition-all duration-200',
        'w-[300px] min-h-[160px]',
        colors.bg,
        colors.border,
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a3a5f]'
      )}
    >
      {/* Header */}
      <div className={cn(
        'px-4 py-2 border-b',
        colors.border,
        'flex items-center gap-2'
      )}>
        <Building2 className={cn('w-5 h-5', colors.text)} />
        <div>
          <h3 className="font-bold text-white">
            {siteNameJa || siteName}
          </h3>
          {siteNameJa && siteName && (
            <p className={cn('text-xs', colors.text)}>{siteName}</p>
          )}
        </div>
        {location && (
          <div className={cn('ml-auto flex items-center gap-1 text-xs', colors.text)}>
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}
      </div>
      
      {/* Content area - routers will be rendered as child nodes */}
      <div className="p-4 min-h-[100px]">
        {/* Child routers will be positioned here via parentNode */}
      </div>
      
      {/* Footer info */}
      <div className={cn(
        'px-4 py-1 text-xs',
        colors.text,
        'border-t',
        colors.border
      )}>
        {routerCount} router{routerCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export const SiteNode = memo(SiteNodeComponent);
