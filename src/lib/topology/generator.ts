// Topology generator - converts parsed router data to React Flow nodes/edges

import type { Node, Edge } from 'reactflow';
import type { 
  Router, 
  UnknownPeer,
  RouterNodeData,
  RemoteRouterNodeData,
  InternetNodeData,
  NetworkNodeData,
  TunnelEdgeData,
  WanEdgeData,
  LanEdgeData
} from '@/types';
import { generateId } from '@/lib/utils';

interface GeneratedTopology {
  nodes: Node[];
  edges: Edge[];
  unknownPeers: UnknownPeer[];
}

// Tier-based layout configuration per rectflow.md spec
interface TierLayoutConfig {
  cloudY: number;      // Tier 1: Cloud Services
  coreY: number;       // Tier 2: Core Datacenter  
  hqY: number;         // Tier 3: HQ Core Network
  regionalY: number;   // Tier 4: Regional Sites
  branchY: number;     // Tier 5: Branch Sites
  networkY: number;    // LAN networks below routers
  nodeSpacingX: number;
  startX: number;
}

const TIER_LAYOUT: TierLayoutConfig = {
  cloudY: 0,
  coreY: 200,
  hqY: 400,
  regionalY: 650,
  branchY: 900,
  networkY: 1100,
  nodeSpacingX: 200,
  startX: 100,
};

// Node size constants per rectflow.md spec
const NODE_SIZES = {
  router: { width: 160, height: 90 },
  cloud: { width: 240, height: 120 },
  site: { width: 300, height: 160 },
};

interface LayoutConfig {
  startX: number;
  startY: number;
  nodeSpacingX: number;
  nodeSpacingY: number;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  startX: 400,
  startY: 100,
  nodeSpacingX: 200,
  nodeSpacingY: 200,
};

/**
 * Generate topology from parsed routers
 */
export function generateTopology(
  routers: Router[],
  layout: LayoutConfig = DEFAULT_LAYOUT
): GeneratedTopology {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const unknownPeers: UnknownPeer[] = [];
  
  // Track positions
  let currentRouterX = layout.startX;
  const routerY = layout.startY + layout.nodeSpacingY;
  
  // Build IP address index for correlation
  const ipIndex = buildIPIndex(routers);
  
  // Create Internet node if any router has a default route
  const hasInternet = routers.some(r => 
    r.routes.some(route => route.isDefault)
  );
  
  if (hasInternet) {
    const defaultGateway = routers
      .flatMap(r => r.routes)
      .find(r => r.isDefault)?.gateway;
      
    nodes.push(createInternetNode(defaultGateway, layout));
  }
  
  // Create router nodes
  for (let i = 0; i < routers.length; i++) {
    const router = routers[i];
    const x = currentRouterX + (i * layout.nodeSpacingX);
    
    nodes.push(createRouterNode(router, x, routerY));
    
    // Create WAN edge to Internet
    if (hasInternet) {
      const wanInterface = router.interfaces.find(iface => iface.type === 'wan');
      if (wanInterface) {
        edges.push(createWanEdge(router.id, wanInterface));
      }
    }
    
    // Create tunnel connections
    for (const tunnel of router.tunnels) {
      const { edge, peer } = createTunnelConnection(
        router,
        tunnel,
        ipIndex,
        layout,
        unknownPeers.length
      );
      
      edges.push(edge);
      
      if (peer) {
        // Check if peer already exists
        const existingPeer = unknownPeers.find(p => p.publicIp === peer.publicIp);
        if (!existingPeer) {
          unknownPeers.push(peer);
          nodes.push(createRemoteRouterNode(
            peer,
            tunnel.name,
            layout.startX + ((routers.length + unknownPeers.length - 1) * layout.nodeSpacingX * 0.7),
            routerY + layout.nodeSpacingY
          ));
        }
      }
    }
    
    // Create LAN network nodes
    const lanInterfaces = router.interfaces.filter(iface => iface.type === 'lan');
    for (let j = 0; j < lanInterfaces.length; j++) {
      const iface = lanInterfaces[j];
      if (iface.network) {
        const networkNodeId = `network-${iface.network.replace(/[./]/g, '-')}`;
        
        // Check if network node already exists
        if (!nodes.find(n => n.id === networkNodeId)) {
          nodes.push(createNetworkNode(
            networkNodeId,
            iface.network,
            iface.cidr || 24,
            router.services.dhcp?.enabled || false,
            x + (j * 150) - 75,
            routerY + layout.nodeSpacingY
          ));
        }
        
        edges.push(createLanEdge(router.id, iface, networkNodeId));
      }
    }
  }
  
  return { nodes, edges, unknownPeers };
}

/**
 * Build IP address index for router correlation
 */
function buildIPIndex(routers: Router[]): Map<string, { routerId: string; interfaceId: string }> {
  const index = new Map<string, { routerId: string; interfaceId: string }>();
  
  for (const router of routers) {
    for (const iface of router.interfaces) {
      if (iface.ipAddress) {
        index.set(iface.ipAddress, {
          routerId: router.id,
          interfaceId: iface.id
        });
      }
    }
  }
  
  return index;
}

/**
 * Create Internet node
 */
function createInternetNode(gateway: string | undefined, layout: LayoutConfig): Node<InternetNodeData> {
  return {
    id: 'internet',
    type: 'internet',
    position: { x: layout.startX, y: layout.startY },
    data: {
      gateway: gateway || '',
      label: 'Internet'
    }
  };
}

/**
 * Create router node
 */
function createRouterNode(router: Router, x: number, y: number): Node<RouterNodeData> {
  return {
    id: router.id,
    type: 'router',
    position: { x, y },
    data: {
      router,
      isSelected: false,
      isHighlighted: false,
      showDetails: true
    }
  };
}

/**
 * Create remote router (unknown peer) node
 */
function createRemoteRouterNode(
  peer: UnknownPeer,
  tunnelName: string | undefined,
  x: number,
  y: number
): Node<RemoteRouterNodeData> {
  return {
    id: peer.id,
    type: 'remoteRouter',
    position: { x, y },
    data: {
      peer,
      tunnelName,
      isSelected: false
    }
  };
}

/**
 * Create network node
 */
function createNetworkNode(
  id: string,
  network: string,
  cidr: number,
  dhcpEnabled: boolean,
  x: number,
  y: number
): Node<NetworkNodeData> {
  return {
    id,
    type: 'network',
    position: { x, y },
    data: {
      network,
      cidr,
      routerCount: 1,
      dhcpEnabled,
      label: 'Local Network'
    }
  };
}

/**
 * Create WAN edge
 */
function createWanEdge(routerId: string, iface: Router['interfaces'][0]): Edge<WanEdgeData> {
  return {
    id: `wan-${routerId}`,
    source: 'internet',
    target: routerId,
    sourceHandle: 'wan',
    targetHandle: 'wan',
    type: 'wan',
    data: {
      interfaceName: iface.name,
      publicIp: iface.ipAddress || '',
      gateway: ''
    }
  };
}

/**
 * Create tunnel connection (edge + potential unknown peer)
 */
function createTunnelConnection(
  router: Router,
  tunnel: Router['tunnels'][0],
  ipIndex: Map<string, { routerId: string; interfaceId: string }>,
  layout: LayoutConfig,
  peerIndex: number
): { edge: Edge<TunnelEdgeData>; peer: UnknownPeer | null } {
  // Check if remote address matches known router
  const knownTarget = ipIndex.get(tunnel.remoteAddress);
  
  let targetId: string;
  let peer: UnknownPeer | null = null;
  
  if (knownTarget) {
    targetId = knownTarget.routerId;
  } else {
    // Create unknown peer
    const peerId = `peer-${tunnel.remoteAddress.replace(/\./g, '-')}`;
    targetId = peerId;
    
    peer = {
      id: peerId,
      publicIp: tunnel.remoteAddress,
      tunnelName: tunnel.name,
      targetNetworks: tunnel.targetNetworks,
      referencedBy: [router.id]
    };
  }
  
  const edge: Edge<TunnelEdgeData> = {
    id: `tunnel-${router.id}-${tunnel.id}`,
    source: router.id,
    target: targetId,
    sourceHandle: `tunnel-${tunnel.id}`,
    targetHandle: 'tunnel',
    type: 'tunnel',
    animated: tunnel.enabled,
    data: {
      tunnelId: tunnel.id,
      tunnelName: tunnel.name,
      localIp: tunnel.localAddress,
      remoteIp: tunnel.remoteAddress,
      networks: tunnel.targetNetworks,
      enabled: tunnel.enabled
    }
  };
  
  return { edge, peer };
}

/**
 * Create LAN edge
 */
function createLanEdge(
  routerId: string,
  iface: Router['interfaces'][0],
  networkNodeId: string
): Edge<LanEdgeData> {
  return {
    id: `lan-${routerId}-${iface.name}`,
    source: routerId,
    target: networkNodeId,
    sourceHandle: iface.id,
    targetHandle: 'router',
    type: 'lan',
    data: {
      interfaceName: iface.name,
      network: iface.network || '',
      cidr: iface.cidr || 24
    }
  };
}

/**
 * Apply hierarchical layout to nodes (legacy)
 */
export function applyHierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
  return applyTierLayout(nodes, edges);
}

/**
 * Apply tier-based layout per rectflow.md specification
 * 
 * Tier 1 (y=0)    - Cloud Services (AWS, Azure, GCP, ISP)
 * Tier 2 (y=200)  - Core Datacenter
 * Tier 3 (y=400)  - HQ Core Network  
 * Tier 4 (y=650)  - Regional Sites
 * Tier 5 (y=900)  - Branch Sites
 * Tier 6 (y=1100) - LAN Networks
 */
export function applyTierLayout(nodes: Node[], edges: Edge[]): Node[] {
  // Categorize nodes
  const cloudNodes = nodes.filter(n => n.type === 'internet' || n.type === 'cloud');
  const routerNodes = nodes.filter(n => n.type === 'router');
  const remoteNodes = nodes.filter(n => n.type === 'remoteRouter');
  const networkNodes = nodes.filter(n => n.type === 'network');
  
  // Calculate tunnel counts to determine router importance (HQ vs Branch)
  const routerTunnelCounts = new Map<string, number>();
  for (const node of routerNodes) {
    const routerData = node.data as RouterNodeData;
    routerTunnelCounts.set(node.id, routerData.router.tunnels.length);
  }
  
  // Sort routers: more tunnels = more important (HQ/regional)
  const sortedRouters = [...routerNodes].sort((a, b) => {
    const countA = routerTunnelCounts.get(a.id) || 0;
    const countB = routerTunnelCounts.get(b.id) || 0;
    return countB - countA;
  });
  
  // Assign tiers based on tunnel count
  const hqRouters: Node[] = [];
  const regionalRouters: Node[] = [];
  const branchRouters: Node[] = [];
  
  for (const router of sortedRouters) {
    const tunnelCount = routerTunnelCounts.get(router.id) || 0;
    if (tunnelCount >= 5) {
      hqRouters.push(router);
    } else if (tunnelCount >= 3) {
      regionalRouters.push(router);
    } else {
      branchRouters.push(router);
    }
  }
  
  // Position cloud/internet nodes at Tier 1
  const totalWidth = Math.max(
    cloudNodes.length,
    hqRouters.length,
    regionalRouters.length,
    branchRouters.length
  ) * TIER_LAYOUT.nodeSpacingX;
  
  cloudNodes.forEach((node, i) => {
    const rowWidth = cloudNodes.length * TIER_LAYOUT.nodeSpacingX;
    const startX = (totalWidth - rowWidth) / 2 + TIER_LAYOUT.startX;
    node.position = {
      x: startX + (i * TIER_LAYOUT.nodeSpacingX),
      y: TIER_LAYOUT.cloudY,
    };
  });
  
  // Position HQ routers at Tier 3
  hqRouters.forEach((node, i) => {
    const rowWidth = hqRouters.length * TIER_LAYOUT.nodeSpacingX;
    const startX = (totalWidth - rowWidth) / 2 + TIER_LAYOUT.startX;
    node.position = {
      x: startX + (i * TIER_LAYOUT.nodeSpacingX),
      y: TIER_LAYOUT.hqY,
    };
  });
  
  // Position regional routers at Tier 4
  regionalRouters.forEach((node, i) => {
    const rowWidth = regionalRouters.length * TIER_LAYOUT.nodeSpacingX;
    const startX = (totalWidth - rowWidth) / 2 + TIER_LAYOUT.startX;
    node.position = {
      x: startX + (i * TIER_LAYOUT.nodeSpacingX),
      y: TIER_LAYOUT.regionalY,
    };
  });
  
  // Position branch routers at Tier 5
  branchRouters.forEach((node, i) => {
    const rowWidth = branchRouters.length * TIER_LAYOUT.nodeSpacingX;
    const startX = (totalWidth - rowWidth) / 2 + TIER_LAYOUT.startX;
    node.position = {
      x: startX + (i * TIER_LAYOUT.nodeSpacingX),
      y: TIER_LAYOUT.branchY,
    };
  });
  
  // Position remote routers between regional and branch
  remoteNodes.forEach((node, i) => {
    const rowWidth = remoteNodes.length * TIER_LAYOUT.nodeSpacingX;
    const startX = (totalWidth - rowWidth) / 2 + TIER_LAYOUT.startX + 100;
    node.position = {
      x: startX + (i * TIER_LAYOUT.nodeSpacingX * 0.8),
      y: TIER_LAYOUT.regionalY + 150,
    };
  });
  
  // Position network nodes at Tier 6
  networkNodes.forEach((node, i) => {
    const rowWidth = networkNodes.length * (TIER_LAYOUT.nodeSpacingX * 0.8);
    const startX = (totalWidth - rowWidth) / 2 + TIER_LAYOUT.startX;
    node.position = {
      x: startX + (i * TIER_LAYOUT.nodeSpacingX * 0.8),
      y: TIER_LAYOUT.networkY,
    };
  });
  
  return nodes;
}
