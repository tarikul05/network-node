// React Flow topology types
import type { Node, Edge } from 'reactflow';
import type { Router, NetworkInterface, Tunnel, Connection, UnknownPeer } from './network';

// Custom node data types
export interface RouterNodeData {
  router: Router;
  isSelected: boolean;
  isHighlighted: boolean;
  showDetails: boolean;
}

export interface RemoteRouterNodeData {
  peer: UnknownPeer;
  tunnelName?: string;
  isSelected: boolean;
}

export interface InternetNodeData {
  gateway: string;
  label: string;
}

export interface NetworkNodeData {
  network: string;
  cidr: number;
  routerCount: number;
  dhcpEnabled: boolean;
  label: string;
}

export interface SiteGroupNodeData {
  siteId: string;
  siteName: string;
  routerCount: number;
  collapsed: boolean;
}

// Custom node types
export type RouterNode = Node<RouterNodeData, 'router'>;
export type RemoteRouterNode = Node<RemoteRouterNodeData, 'remoteRouter'>;
export type InternetNode = Node<InternetNodeData, 'internet'>;
export type NetworkNode = Node<NetworkNodeData, 'network'>;
export type SiteGroupNode = Node<SiteGroupNodeData, 'siteGroup'>;

export type TopologyNode = 
  | RouterNode 
  | RemoteRouterNode 
  | InternetNode 
  | NetworkNode 
  | SiteGroupNode;

// Custom edge data types
export interface TunnelEdgeData {
  tunnelId: number;
  tunnelName?: string;
  localIp: string;
  remoteIp: string;
  networks: string[];
  enabled: boolean;
}

export interface WanEdgeData {
  interfaceName: string;
  publicIp: string;
  gateway: string;
}

export interface LanEdgeData {
  interfaceName: string;
  network: string;
  cidr: number;
}

// Custom edge types
export type TunnelEdge = Edge<TunnelEdgeData>;
export type WanEdge = Edge<WanEdgeData>;
export type LanEdge = Edge<LanEdgeData>;

export type TopologyEdge = TunnelEdge | WanEdge | LanEdge;

// Layout types
export type LayoutType = 'hierarchical' | 'radial' | 'force' | 'manual';

export interface LayoutOptions {
  type: LayoutType;
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSpacing?: number;
  levelSpacing?: number;
}
