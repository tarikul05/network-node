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

interface LayoutConfig {
  startX: number;
  startY: number;
  nodeSpacingX: number;
  nodeSpacingY: number;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  startX: 400,
  startY: 100,
  nodeSpacingX: 300,
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
 * Apply hierarchical layout to nodes
 */
export function applyHierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
  // Simple hierarchical layout
  const levels: Map<string, number> = new Map();
  
  // Internet at level 0
  const internetNode = nodes.find(n => n.type === 'internet');
  if (internetNode) {
    levels.set(internetNode.id, 0);
  }
  
  // Routers at level 1
  nodes.filter(n => n.type === 'router').forEach((node, i) => {
    levels.set(node.id, 1);
    node.position = {
      x: 100 + (i * 350),
      y: 200
    };
  });
  
  // Remote routers at level 2
  nodes.filter(n => n.type === 'remoteRouter').forEach((node, i) => {
    levels.set(node.id, 2);
    node.position = {
      x: 50 + (i * 250),
      y: 500
    };
  });
  
  // Networks at level 2
  nodes.filter(n => n.type === 'network').forEach((node, i) => {
    levels.set(node.id, 2);
    node.position = {
      x: 400 + (i * 250),
      y: 500
    };
  });
  
  // Center internet node
  if (internetNode) {
    const routerNodes = nodes.filter(n => n.type === 'router');
    if (routerNodes.length > 0) {
      const avgX = routerNodes.reduce((sum, n) => sum + n.position.x, 0) / routerNodes.length;
      internetNode.position = { x: avgX, y: 50 };
    }
  }
  
  return nodes;
}
