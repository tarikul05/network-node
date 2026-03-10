// Core network topology types

export interface NetworkTopology {
  routers: Router[];
  connections: Connection[];
  sites: Site[];
  unknownPeers: UnknownPeer[];
  metadata: TopologyMetadata;
}

export interface TopologyMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface Site {
  id: string;
  name: string;
  description?: string;
  routers: string[]; // Router IDs
  position?: Position;
  collapsed?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Router {
  id: string;
  hostname: string;
  model?: string;
  serial?: string;
  firmware?: string;
  siteId?: string;
  interfaces: NetworkInterface[];
  tunnels: Tunnel[];
  routes: Route[];
  services: RouterServices;
  metadata: RouterMetadata;
  position?: Position;
  configSource?: string;
}

export interface RouterMetadata {
  macAddresses: string[];
  memory?: string;
  hardware?: string;
  reportingDate?: string;
}

export interface RouterServices {
  dhcp?: DHCPConfig;
  dns?: DNSConfig;
  nat?: NATConfig[];
}

export interface DHCPConfig {
  enabled: boolean;
  scopes: DHCPScope[];
}

export interface DHCPScope {
  id: number;
  rangeStart: string;
  rangeEnd: string;
  cidr: number;
  gateway: string;
}

export interface DNSConfig {
  servers: string[];
  privateSpoof: boolean;
}

export interface NATConfig {
  id: number;
  type: 'masquerade' | 'static';
  outerAddress: string;
  innerRange?: string;
  staticMappings: NATStaticMapping[];
}

export interface NATStaticMapping {
  innerIp: string;
  protocol: string;
  port?: number | string;
}

export interface NetworkInterface {
  id: string;
  name: string;
  type: InterfaceType;
  ipAddress?: string;
  cidr?: number;
  network?: string;
  status: InterfaceStatus;
  description?: string;
  natDescriptor?: number;
}

export type InterfaceType = 
  | 'lan'
  | 'wan'
  | 'pp'
  | 'tunnel'
  | 'loopback'
  | 'vlan'
  | 'bri';

export type InterfaceStatus = 'up' | 'down' | 'admin-down' | 'unknown';

export interface Tunnel {
  id: number;
  name?: string;
  description?: string;
  localAddress: string;
  remoteAddress: string;
  enabled: boolean;
  targetNetworks: string[];
  ipsec: IPSecConfig;
}

export interface IPSecConfig {
  encryption?: string;
  hash?: string;
  pfs: boolean;
  keepalive: boolean;
  alwaysOn: boolean;
  saPolicy?: string;
}

export interface Route {
  id: string;
  network: string;
  gateway: string;
  gatewayType: 'ip' | 'tunnel' | 'interface';
  tunnelId?: number;
  metric?: number;
  isDefault?: boolean;
}

export interface Connection {
  id: string;
  type: ConnectionType;
  sourceRouterId: string;
  sourceInterfaceId: string;
  targetRouterId: string;
  targetInterfaceId: string;
  network?: string;
  tunnelId?: number;
  tunnelName?: string;
  bandwidth?: string;
  status: ConnectionStatus;
  verified: boolean;
}

export type ConnectionType = 
  | 'lan'      // Shared LAN segment
  | 'wan'      // WAN/Internet
  | 'tunnel'   // IPSec VPN
  | 'p2p'      // Point-to-point
  | 'unknown';

export type ConnectionStatus = 'active' | 'inactive' | 'unknown';

export interface UnknownPeer {
  id: string;
  publicIp: string;
  tunnelName?: string;
  targetNetworks: string[];
  referencedBy: string[]; // Router IDs that reference this peer
}
