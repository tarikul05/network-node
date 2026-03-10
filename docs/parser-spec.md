# Yamaha RTX Parser Specification

Based on real RTX1210 configuration analysis.

---

## 📋 Config Structure Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    RTX1210 CONFIG STRUCTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  HEADER COMMENTS (Metadata)                              │    │
│  │  # RTX1210 Rev.14.01.05                                  │    │
│  │  # MAC Address : 00:a0:de:c8:ff:00...                    │    │
│  │  # Memory 256Mbytes, 3LAN, 1BRI                          │    │
│  │  # Serial: S4H019271                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ROUTING TABLE                                           │    │
│  │  ip route default gateway 126.113.227.117                │    │
│  │  ip route 192.168.9.0/24 gateway tunnel 4                │    │
│  │  ip route 192.168.10.0/24 gateway tunnel 1               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  LAN INTERFACES                                          │    │
│  │  ip lan1 address 192.168.201.1/24                        │    │
│  │  ip lan2 address 126.113.227.118/30                      │    │
│  │  ip lan2 nat descriptor 1                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TUNNEL DEFINITIONS (IPSec VPN)                          │    │
│  │  tunnel select 1                                         │    │
│  │    tunnel name INFRA-RTX1200                             │    │
│  │    description tunnel INFRA-RTX1200                      │    │
│  │    ipsec ike remote address 1 126.113.220.91             │    │
│  │    ipsec ike local address 1 192.168.201.1               │    │
│  │  tunnel select 2...                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  NAT CONFIGURATION                                       │    │
│  │  nat descriptor type 1 masquerade                        │    │
│  │  nat descriptor masquerade static 1 1 192.168.201.1 esp  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SERVICES                                                │    │
│  │  dhcp scope 1 192.168.201.200-254/24                     │    │
│  │  dns server 143.90.68.11 143.90.68.12                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Extracted Data Model

From the sample config, we extract:

### Router Metadata
```typescript
interface RouterMetadata {
  model: "RTX1210";
  firmware: "Rev.14.01.05";
  firmwareDate: "Thu Nov 6 08:45:55 2014";
  macAddresses: [
    "00:a0:de:c8:ff:00",
    "00:a0:de:c8:ff:12", 
    "00:a0:dd:c8:ff:20"
  ];
  memory: "256Mbytes";
  hardware: "3LAN, 1BRI";
  serial: "S4H019271";
  reportingDate: "Oct 17 15:53:48 2025";
}
```

### Network Interfaces
```typescript
interface ParsedInterfaces {
  lan: [
    {
      name: "lan1",
      ip: "192.168.201.1",
      subnet: "/24",
      network: "192.168.201.0/24",
      type: "lan",
      nat: null
    },
    {
      name: "lan2", 
      ip: "126.113.227.118",
      subnet: "/30",
      network: "126.113.227.116/30",
      type: "wan",
      nat: 1  // NAT descriptor reference
    }
  ]
}
```

### VPN Tunnels
```typescript
interface ParsedTunnels {
  tunnels: [
    {
      id: 1,
      name: "INFRA-RTX1200",
      description: "INFRA-RTX1200",
      localAddress: "192.168.201.1",
      remoteAddress: "126.113.220.91",
      enabled: true,
      ipsec: {
        encryption: "des-cbc",
        hash: "md5",
        pfs: false,
        keepalive: true,
        alwaysOn: true
      },
      targetNetworks: ["192.168.10.0/24"]  // From routing table
    },
    {
      id: 2,
      name: "MONITORING-STANDBY-TEST",
      remoteAddress: "219.201.220.30",
      targetNetworks: ["192.168.101.0/24"]
    },
    {
      id: 3,
      name: "FILESERVER",
      remoteAddress: "126.113.161.71",
      targetNetworks: ["192.168.103.0/24"]
    },
    {
      id: 4,
      name: "TWIN-INFRA",
      remoteAddress: "219.101.130.91",
      targetNetworks: ["192.168.9.0/24"]
    }
  ]
}
```

### Routing Table
```typescript
interface ParsedRoutes {
  defaultGateway: "126.113.227.117",
  routes: [
    { network: "192.168.9.0/24", gateway: "tunnel 4" },
    { network: "192.168.10.0/24", gateway: "tunnel 1" },
    { network: "192.168.101.0/24", gateway: "tunnel 2" },
    { network: "192.168.103.0/24", gateway: "tunnel 3" }
  ]
}
```

---

## 🗺️ Topology Visualization Model

Based on this config, the topology would show:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NETWORK TOPOLOGY VIEW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              INTERNET                                        │
│                                 │                                            │
│                         126.113.227.117                                      │
│                           (Default GW)                                       │
│                                 │                                            │
│                                 │                                            │
│         ┌───────────────────────┴───────────────────────┐                   │
│         │                                               │                    │
│         │              THIS ROUTER                      │                    │
│         │    ┌─────────────────────────────────┐        │                    │
│         │    │         RTX1210                 │        │                    │
│         │    │      S/N: S4H019271             │        │                    │
│         │    ├─────────────────────────────────┤        │                    │
│         │    │ ● lan1: 192.168.201.1/24        │        │                    │
│         │    │ ● lan2: 126.113.227.118/30 [WAN]│        │                    │
│         │    └─────────────────────────────────┘        │                    │
│         │         │       │       │       │             │                    │
│         └─────────┼───────┼───────┼───────┼─────────────┘                   │
│                   │       │       │       │                                  │
│            ┌──────┘       │       │       └──────┐                           │
│            │              │       │              │                           │
│            ▼              ▼       ▼              ▼                           │
│    ╔═══════════════╗ ╔═══════════════╗ ╔═══════════════╗ ╔═══════════════╗  │
│    ║   TUNNEL 1    ║ ║   TUNNEL 2    ║ ║   TUNNEL 3    ║ ║   TUNNEL 4    ║  │
│    ║ ~~~~~~~~~~~~~ ║ ║ ~~~~~~~~~~~~~ ║ ║ ~~~~~~~~~~~~~ ║ ║ ~~~~~~~~~~~~~ ║  │
│    ║ INFRA-RTX1200 ║ ║  MONITORING   ║ ║  FILESERVER   ║ ║  TWIN-INFRA   ║  │
│    ╠═══════════════╣ ╠═══════════════╣ ╠═══════════════╣ ╠═══════════════╣  │
│    ║Remote:        ║ ║Remote:        ║ ║Remote:        ║ ║Remote:        ║  │
│    ║126.113.220.91 ║ ║219.201.220.30 ║ ║126.113.161.71 ║ ║219.101.130.91 ║  │
│    ╠═══════════════╣ ╠═══════════════╣ ╠═══════════════╣ ╠═══════════════╣  │
│    ║Networks:      ║ ║Networks:      ║ ║Networks:      ║ ║Networks:      ║  │
│    ║192.168.10.0/24║ ║192.168.101/24 ║ ║192.168.103/24 ║ ║192.168.9.0/24 ║  │
│    ╚═══════════════╝ ╚═══════════════╝ ╚═══════════════╝ ╚═══════════════╝  │
│            │              │       │              │                           │
│            ▼              ▼       ▼              ▼                           │
│    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│    │ Remote Router │ │ Remote Router │ │ Remote Router │ │ Remote Router │  │
│    │   (Unknown)   │ │   (Unknown)   │ │   (Unknown)   │ │   (Unknown)   │  │
│    │ 192.168.10.x  │ │ 192.168.101.x │ │ 192.168.103.x │ │ 192.168.9.x   │  │
│    └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘  │
│                                                                              │
│    LOCAL NETWORK: 192.168.201.0/24                                          │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  DHCP Pool: 192.168.201.200-254                                 │      │
│    │  Gateway: 192.168.201.1                                         │      │
│    │  DNS: 143.90.68.11, 143.90.68.12                                │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Multi-Router Correlation

When multiple configs are uploaded, the system correlates:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MULTI-ROUTER CORRELATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CONFIG FILE 1: Main Router                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  tunnel select 1                                                    │    │
│  │    ipsec ike remote address 1 → 126.113.220.91                      │────┐│
│  └─────────────────────────────────────────────────────────────────────┘    ││
│                                                                              ││
│  CONFIG FILE 2: INFRA Router                                                 ││
│  ┌─────────────────────────────────────────────────────────────────────┐    ││
│  │  ip lan2 address 126.113.220.91/30                                  │◄───┘│
│  │    ipsec ike remote address 1 → 126.113.227.118                     │────┐│
│  └─────────────────────────────────────────────────────────────────────┘    ││
│                                                                              ││
│  CORRELATION RESULT:                                                         ││
│  ┌─────────────────────────────────────────────────────────────────────┐    ││
│  │                                                                     │    ││
│  │   [RTX1210]  ═══════ IPSec Tunnel ═══════  [INFRA-RTX1200]         │◄───┘│
│  │   Main Site                                 Remote Site             │    │
│  │   192.168.201.0/24                          192.168.10.0/24         │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Parser Regex Patterns

```typescript
// Header patterns
const PATTERNS = {
  // Model and firmware
  model: /^# (\w+) (Rev\.\d+\.\d+\.\d+)/,
  // # RTX1210 Rev.14.01.05
  
  // MAC addresses  
  macAddress: /# MAC Address : ([\w:,\s]+)/,
  // # MAC Address : 00:a0:de:c8:ff:00, 00:a0:de:c8:ff:12
  
  // Hardware info
  hardware: /# Memory (\d+\w+), (.+)/,
  // # Memory 256Mbytes, 3LAN, 1BRI
  
  // Serial number
  serial: /serial=(\w+)/,
  // serial=S4H019271
  
  // LAN interface
  lanAddress: /ip (lan\d+) address ([\d.]+)\/(\d+)/,
  // ip lan1 address 192.168.201.1/24
  
  // NAT descriptor binding
  lanNat: /ip (lan\d+) nat descriptor (\d+)/,
  // ip lan2 nat descriptor 1
  
  // Default route
  defaultRoute: /ip route default gateway ([\d.]+)/,
  // ip route default gateway 126.113.227.117
  
  // Static routes
  staticRoute: /ip route ([\d.]+\/\d+) gateway (tunnel \d+|[\d.]+)/,
  // ip route 192.168.9.0/24 gateway tunnel 4
  
  // Tunnel selection (start of block)
  tunnelSelect: /^tunnel select (\d+)/,
  // tunnel select 1
  
  // Tunnel name
  tunnelName: /tunnel name (.+)/,
  // tunnel name INFRA-RTX1200
  
  // Tunnel description
  tunnelDesc: /description tunnel (.+)/,
  // description tunnel INFRA-RTX1200
  
  // IPSec remote address
  ipsecRemote: /ipsec ike remote address (\d+) ([\d.]+)/,
  // ipsec ike remote address 1 126.113.220.91
  
  // IPSec local address
  ipsecLocal: /ipsec ike local address (\d+) ([\d.]+)/,
  // ipsec ike local address 1 192.168.201.1
  
  // Tunnel enable status
  tunnelEnable: /tunnel enable (\d+)/,
  // tunnel enable 1
  
  // DHCP scope
  dhcpScope: /dhcp scope (\d+) ([\d.-]+)\/(\d+)/,
  // dhcp scope 1 192.168.201.200-192.168.201.254/24
  
  // DNS servers
  dnsServer: /dns server ([\d.\s]+)/,
  // dns server 143.90.68.11 143.90.68.12
};
```

---

## 🏗️ Complete Parsed Output

```typescript
interface ParsedRouterConfig {
  metadata: {
    model: "RTX1210";
    firmware: "Rev.14.01.05";
    serial: "S4H019271";
    macAddresses: string[];
    memory: "256Mbytes";
    hardware: "3LAN, 1BRI";
    reportingDate: string;
  };
  
  interfaces: {
    lan: Array<{
      name: string;
      ip: string;
      cidr: number;
      network: string;
      type: "lan" | "wan";
      natDescriptor: number | null;
    }>;
  };
  
  routing: {
    defaultGateway: string;
    staticRoutes: Array<{
      network: string;
      gateway: string;
      gatewayType: "tunnel" | "ip";
    }>;
  };
  
  tunnels: Array<{
    id: number;
    name: string;
    description: string;
    localAddress: string;
    remoteAddress: string;
    enabled: boolean;
    targetNetworks: string[];  // Derived from routing table
    ipsec: {
      encryption: string;
      hash: string;
      pfs: boolean;
      keepalive: boolean;
      alwaysOn: boolean;
    };
  }>;
  
  nat: {
    descriptors: Array<{
      id: number;
      type: "masquerade" | "static";
      outerAddress: string;
      innerRange: string;
      staticMappings: Array<{
        innerIp: string;
        protocol: string;
        port?: number;
      }>;
    }>;
  };
  
  services: {
    dhcp: {
      enabled: boolean;
      scopes: Array<{
        id: number;
        range: string;
        cidr: number;
        gateway: string;
      }>;
    };
    dns: {
      servers: string[];
      privateSpoof: boolean;
    };
  };
}
```

---

## 🎯 React Flow Node Generation

From parsed config, generate nodes:

```typescript
// Node generation from parsed config
function generateTopologyNodes(config: ParsedRouterConfig): Node[] {
  const nodes: Node[] = [];
  
  // 1. Main router node
  nodes.push({
    id: `router-${config.metadata.serial}`,
    type: 'routerNode',
    position: { x: 400, y: 200 },
    data: {
      hostname: config.metadata.model,
      serial: config.metadata.serial,
      firmware: config.metadata.firmware,
      interfaces: config.interfaces.lan,
      status: 'online'
    }
  });
  
  // 2. Tunnel endpoint nodes (remote routers)
  config.tunnels.forEach((tunnel, index) => {
    nodes.push({
      id: `remote-${tunnel.id}`,
      type: 'remoteRouterNode',
      position: { x: 100 + (index * 200), y: 500 },
      data: {
        name: tunnel.name,
        publicIp: tunnel.remoteAddress,
        networks: tunnel.targetNetworks,
        tunnelId: tunnel.id,
        status: tunnel.enabled ? 'connected' : 'disconnected'
      }
    });
  });
  
  // 3. Internet/WAN node
  nodes.push({
    id: 'internet',
    type: 'internetNode',
    position: { x: 400, y: 50 },
    data: {
      gateway: config.routing.defaultGateway
    }
  });
  
  // 4. Local network node
  nodes.push({
    id: 'local-network',
    type: 'networkNode',
    position: { x: 400, y: 350 },
    data: {
      network: config.interfaces.lan[0]?.network,
      dhcp: config.services.dhcp.scopes[0],
      dns: config.services.dns.servers
    }
  });
  
  return nodes;
}
```

---

## 📊 Edge Generation

```typescript
function generateTopologyEdges(config: ParsedRouterConfig): Edge[] {
  const edges: Edge[] = [];
  const routerId = `router-${config.metadata.serial}`;
  
  // 1. Internet connection
  edges.push({
    id: 'edge-internet',
    source: 'internet',
    target: routerId,
    type: 'wanEdge',
    data: {
      interface: 'lan2',
      ip: config.interfaces.lan.find(i => i.type === 'wan')?.ip
    }
  });
  
  // 2. Tunnel connections
  config.tunnels.forEach(tunnel => {
    edges.push({
      id: `edge-tunnel-${tunnel.id}`,
      source: routerId,
      target: `remote-${tunnel.id}`,
      type: 'tunnelEdge',
      animated: tunnel.enabled,
      data: {
        tunnelName: tunnel.name,
        localIp: tunnel.localAddress,
        remoteIp: tunnel.remoteAddress,
        networks: tunnel.targetNetworks
      }
    });
  });
  
  // 3. Local network connection
  edges.push({
    id: 'edge-local',
    source: routerId,
    target: 'local-network',
    type: 'lanEdge',
    data: {
      interface: 'lan1',
      network: config.interfaces.lan[0]?.network
    }
  });
  
  return edges;
}
```

---

## 🎨 Custom Node Types Needed

| Node Type | Purpose | Visual |
|-----------|---------|--------|
| `routerNode` | Main router with full details | Box with ports |
| `remoteRouterNode` | Discovered remote endpoint | Dashed box |
| `internetNode` | Internet/WAN cloud | Cloud icon |
| `networkNode` | Local subnet | Network segment |
| `unknownNode` | Unidentified peer | Gray placeholder |

---

## 🔗 Edge Types Needed

| Edge Type | Purpose | Visual |
|-----------|---------|--------|
| `wanEdge` | Internet connection | Blue solid line |
| `tunnelEdge` | IPSec VPN | Orange dashed, animated |
| `lanEdge` | Local network | Green solid |
| `p2pEdge` | Point-to-point | Purple solid |

---

This parser specification provides everything needed to build the config parser and topology generator. Ready to implement?
