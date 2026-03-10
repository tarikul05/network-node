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
  siteNameJa?: string;
  routerCount: number;
  collapsed: boolean;
  tier: 'core' | 'regional' | 'branch';
  location?: string;
}

export interface CloudNodeData {
  title: string;
  description?: string;
  type: 'aws' | 'azure' | 'gcp' | 'salesforce' | 'datacenter' | 'isp' | 'generic';
  ipAddress?: string;
}

export interface NetworkLabelNodeData {
  network: string;
  cidr?: number;
  label?: string;
  type: 'lan' | 'wan' | 'dmz' | 'management';
}

// Custom node types
export type RouterNode = Node<RouterNodeData, 'router'>;
export type RemoteRouterNode = Node<RemoteRouterNodeData, 'remoteRouter'>;
export type InternetNode = Node<InternetNodeData, 'internet'>;
export type NetworkNode = Node<NetworkNodeData, 'network'>;
export type SiteGroupNode = Node<SiteGroupNodeData, 'siteGroup'>;
export type CloudNode = Node<CloudNodeData, 'cloud'>;
export type NetworkLabelNode = Node<NetworkLabelNodeData, 'networkLabel'>;

export type TopologyNode = 
  | RouterNode 
  | RemoteRouterNode 
  | InternetNode 
  | NetworkNode 
  | SiteGroupNode
  | CloudNode
  | NetworkLabelNode;

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

export interface BackboneEdgeData {
  label?: string;
  bandwidth?: string;
  isRedundant?: boolean;
}

export interface VpnEdgeData {
  tunnelName?: string;
  localIp?: string;
  remoteIp?: string;
  encryption?: string;
  enabled?: boolean;
}

export interface InternetEdgeData {
  publicIp?: string;
  isp?: string;
  type?: 'fiber' | 'dsl' | 'cable' | 'wireless' | 'leased';
}

// Custom edge types
export type TunnelEdge = Edge<TunnelEdgeData>;
export type WanEdge = Edge<WanEdgeData>;
export type LanEdge = Edge<LanEdgeData>;
export type BackboneEdge = Edge<BackboneEdgeData>;
export type VpnEdge = Edge<VpnEdgeData>;
export type InternetEdge = Edge<InternetEdgeData>;

export type TopologyEdge = 
  | TunnelEdge 
  | WanEdge 
  | LanEdge 
  | BackboneEdge 
  | VpnEdge 
  | InternetEdge;

// Layout types
export type LayoutType = 'tier' | 'hierarchical' | 'radial' | 'force' | 'manual';

export interface LayoutOptions {
  type: LayoutType;
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSpacing?: number;
  levelSpacing?: number;
}
