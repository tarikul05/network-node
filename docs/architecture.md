# Complete Network Topology System Architecture

## 🎯 System Overview

This document provides a sophisticated plan for building a network topology viewer that parses Yamaha RTX router configurations and renders interactive diagrams.

---

## 📁 Final Project Structure

```
network-node/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Main topology page
│   ├── globals.css                   # Global styles
│   └── api/                          # (Empty - no backend)
│
├── components/
│   ├── topology/
│   │   ├── TopologyCanvas.tsx        # Main React Flow wrapper
│   │   ├── TopologyControls.tsx      # Zoom, fit, export buttons
│   │   ├── TopologyMinimap.tsx       # Mini navigation map
│   │   │
│   │   ├── nodes/
│   │   │   ├── index.ts              # Node type registry
│   │   │   ├── RouterNode.tsx        # Main router visualization
│   │   │   ├── RemoteRouterNode.tsx  # Remote peer placeholder
│   │   │   ├── InternetNode.tsx      # WAN/Internet cloud
│   │   │   ├── NetworkNode.tsx       # Subnet representation
│   │   │   ├── SiteGroupNode.tsx     # Collapsible site container
│   │   │   └── InterfaceHandle.tsx   # Port connection points
│   │   │
│   │   ├── edges/
│   │   │   ├── index.ts              # Edge type registry
│   │   │   ├── TunnelEdge.tsx        # IPSec VPN connection
│   │   │   ├── WanEdge.tsx           # Internet connection
│   │   │   ├── LanEdge.tsx           # Local network link
│   │   │   └── EdgeLabel.tsx         # Connection info label
│   │   │
│   │   └── overlays/
│   │       ├── ConnectionInfo.tsx    # Hover tooltip
│   │       └── RoutePathHighlight.tsx # Route visualization
│   │
│   ├── upload/
│   │   ├── ConfigUploader.tsx        # Drag & drop zone
│   │   ├── FileList.tsx              # Uploaded files list
│   │   ├── ConfigPreview.tsx         # Raw config viewer
│   │   └── ParseStatus.tsx           # Parsing progress/errors
│   │
│   ├── panels/
│   │   ├── SidePanel.tsx             # Resizable side panel
│   │   ├── RouterDetailPanel.tsx     # Selected router info
│   │   ├── TunnelDetailPanel.tsx     # VPN tunnel details
│   │   ├── NetworkDetailPanel.tsx    # Subnet information
│   │   ├── SiteManagerPanel.tsx      # Site assignment UI
│   │   └── ExportPanel.tsx           # Export options
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Tooltip.tsx
│       ├── Dialog.tsx
│       ├── Tabs.tsx
│       └── Icons.tsx
│
├── lib/
│   ├── parsers/
│   │   ├── index.ts                  # Parser factory
│   │   ├── types.ts                  # Parser result types
│   │   ├── yamaha/
│   │   │   ├── index.ts              # Main Yamaha parser
│   │   │   ├── patterns.ts           # Regex patterns
│   │   │   ├── headerParser.ts       # Metadata extraction
│   │   │   ├── interfaceParser.ts    # LAN/WAN interfaces
│   │   │   ├── tunnelParser.ts       # IPSec tunnels
│   │   │   ├── routeParser.ts        # Routing table
│   │   │   ├── natParser.ts          # NAT configuration
│   │   │   └── serviceParser.ts      # DHCP, DNS
│   │   │
│   │   └── cisco/                    # Future expansion
│   │       └── index.ts
│   │
│   ├── analyzers/
│   │   ├── correlationEngine.ts      # Multi-router correlation
│   │   ├── connectionDetector.ts     # Auto-detect connections
│   │   ├── networkGrouper.ts         # Group by subnet
│   │   └── tunnelMatcher.ts          # Match tunnel endpoints
│   │
│   ├── topology/
│   │   ├── nodeGenerator.ts          # Create React Flow nodes
│   │   ├── edgeGenerator.ts          # Create React Flow edges
│   │   ├── layoutEngine.ts           # Auto-layout algorithms
│   │   │   ├── hierarchical.ts       # Top-down layout
│   │   │   ├── radial.ts             # Circular layout
│   │   │   └── force.ts              # Force-directed
│   │   └── positionCalculator.ts     # Node positioning
│   │
│   ├── utils/
│   │   ├── ipUtils.ts                # IP/subnet calculations
│   │   ├── cidrUtils.ts              # CIDR notation helpers
│   │   ├── colorUtils.ts             # Interface type colors
│   │   ├── exportUtils.ts            # PNG/SVG/JSON export
│   │   └── storageUtils.ts           # LocalStorage helpers
│   │
│   └── constants/
│       ├── nodeStyles.ts             # Node visual constants
│       ├── edgeStyles.ts             # Edge visual constants
│       └── interfaceTypes.ts         # Interface classifications
│
├── store/
│   ├── index.ts                      # Store exports
│   ├── topologyStore.ts              # Main network state
│   ├── uiStore.ts                    # UI/panel state
│   ├── configStore.ts                # Uploaded configs
│   └── selectors/
│       ├── routerSelectors.ts
│       ├── connectionSelectors.ts
│       └── networkSelectors.ts
│
├── types/
│   ├── index.ts                      # Type exports
│   ├── network.ts                    # Core network types
│   ├── router.ts                     # Router/interface types
│   ├── tunnel.ts                     # VPN tunnel types
│   ├── topology.ts                   # React Flow types
│   └── parser.ts                     # Parser result types
│
├── hooks/
│   ├── useTopology.ts                # Topology operations
│   ├── useParser.ts                  # Config parsing
│   ├── useAutoLayout.ts              # Layout algorithms
│   ├── useSelection.ts               # Node/edge selection
│   ├── useCorrelation.ts             # Multi-router matching
│   └── usePersistence.ts             # Save/load state
│
├── docs/
│   ├── architecture.md               # This file
│   ├── parser-spec.md                # Parser specification
│   └── sample-configs/
│       └── rtx1210-sample.txt        # Sample config
│
└── public/
    └── icons/
        ├── router.svg
        ├── cloud.svg
        └── network.svg
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │   CONFIG FILES   │  User uploads router config files                      │
│  │   (.txt/.cfg)    │                                                        │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐                                                        │
│  │  FILE READER     │  Browser FileReader API                                │
│  │  (ConfigUploader)│  Reads file content as text                            │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐                                                        │
│  │  PARSER FACTORY  │  Detects config format (Yamaha/Cisco)                  │
│  │  (parsers/index) │  Selects appropriate parser                            │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │                    YAMAHA PARSER                            │             │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │             │
│  │  │  Header    │ │ Interface  │ │  Tunnel    │ │  Route   │ │             │
│  │  │  Parser    │ │  Parser    │ │  Parser    │ │  Parser  │ │             │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘ │             │
│  │        │              │              │             │        │             │
│  │        └──────────────┴──────────────┴─────────────┘        │             │
│  │                           │                                 │             │
│  └───────────────────────────┼─────────────────────────────────┘             │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐           │
│  │                   PARSED ROUTER CONFIG                        │           │
│  │  {                                                            │           │
│  │    metadata: { model, serial, firmware }                      │           │
│  │    interfaces: [ { name, ip, network } ]                      │           │
│  │    tunnels: [ { name, remoteIp, networks } ]                  │           │
│  │    routes: [ { network, gateway } ]                           │           │
│  │  }                                                            │           │
│  └──────────────────────────┬───────────────────────────────────┘           │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────┐                                                        │
│  │  ZUSTAND STORE   │  Store parsed configs                                  │
│  │  (configStore)   │  Trigger correlation                                   │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │              CORRELATION ENGINE                             │             │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │             │
│  │  │ Connection     │  │ Tunnel         │  │ Network       │ │             │
│  │  │ Detector       │  │ Matcher        │  │ Grouper       │ │             │
│  │  │ (same subnet)  │  │ (IP matching)  │  │ (site assign) │ │             │
│  │  └───────┬────────┘  └───────┬────────┘  └───────┬───────┘ │             │
│  │          │                   │                   │          │             │
│  │          └───────────────────┴───────────────────┘          │             │
│  │                              │                              │             │
│  └──────────────────────────────┼──────────────────────────────┘             │
│                                 │                                            │
│                                 ▼                                            │
│  ┌──────────────────────────────────────────────────────────────┐           │
│  │                  CORRELATED TOPOLOGY                          │           │
│  │  {                                                            │           │
│  │    routers: [ ... with discovered peers ]                     │           │
│  │    connections: [ { source, target, type } ]                  │           │
│  │    sites: [ { routers grouped by location } ]                 │           │
│  │  }                                                            │           │
│  └──────────────────────────┬───────────────────────────────────┘           │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │                TOPOLOGY GENERATOR                           │             │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │             │
│  │  │ Node           │  │ Edge           │  │ Layout        │ │             │
│  │  │ Generator      │  │ Generator      │  │ Engine        │ │             │
│  │  │ (React Flow)   │  │ (React Flow)   │  │ (positioning) │ │             │
│  │  └───────┬────────┘  └───────┬────────┘  └───────┬───────┘ │             │
│  │          │                   │                   │          │             │
│  │          └───────────────────┴───────────────────┘          │             │
│  │                              │                              │             │
│  └──────────────────────────────┼──────────────────────────────┘             │
│                                 │                                            │
│                                 ▼                                            │
│  ┌──────────────────┐                                                        │
│  │  TOPOLOGY STORE  │  React Flow nodes & edges                              │
│  │  (topologyStore) │  Positions, selection state                            │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐           │
│  │                    REACT FLOW CANVAS                          │           │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │           │
│  │  │ Router     │ │ Tunnel     │ │ Network    │ │ Site       │ │           │
│  │  │ Nodes      │ │ Edges      │ │ Nodes      │ │ Groups     │ │           │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │           │
│  └──────────────────────────────────────────────────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Multi-Router Correlation Algorithm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               MULTI-ROUTER CORRELATION ALGORITHM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INPUT: Array of ParsedRouterConfig                                          │
│                                                                              │
│  STEP 1: Build IP Address Index                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Map<IP Address, Router Info>                                       │    │
│  │  {                                                                  │    │
│  │    "192.168.201.1": { router: "RTX1210", interface: "lan1" }        │    │
│  │    "126.113.227.118": { router: "RTX1210", interface: "lan2" }      │    │
│  │    "126.113.220.91": { router: "INFRA", interface: "lan2" }         │    │
│  │  }                                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  STEP 2: Match Tunnel Endpoints                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  For each tunnel:                                                   │    │
│  │    remoteAddress = tunnel.ipsec.remoteAddress                       │    │
│  │    if ipIndex.has(remoteAddress):                                   │    │
│  │      connection = {                                                 │    │
│  │        source: currentRouter,                                       │    │
│  │        target: ipIndex.get(remoteAddress).router,                   │    │
│  │        type: "tunnel",                                              │    │
│  │        verified: true                                               │    │
│  │      }                                                              │    │
│  │    else:                                                            │    │
│  │      createPlaceholderRouter(remoteAddress)                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  STEP 3: Detect Shared Networks                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Group interfaces by network:                                       │    │
│  │  Map<Network, Interface[]>                                          │    │
│  │  {                                                                  │    │
│  │    "192.168.201.0/24": [                                            │    │
│  │      { router: "RTX1210", interface: "lan1", ip: "192.168.201.1" }  │    │
│  │      { router: "RTX830", interface: "lan1", ip: "192.168.201.2" }   │    │
│  │    ]                                                                │    │
│  │  }                                                                  │    │
│  │                                                                     │    │
│  │  For networks with 2+ interfaces:                                   │    │
│  │    Create LAN connection between all routers                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  STEP 4: Infer Site Groupings                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Site inference rules:                                              │    │
│  │    1. Routers on same LAN → same site                               │    │
│  │    2. User can manually assign sites                                │    │
│  │    3. Tunnel description hints (e.g., "Tokyo-DC")                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  OUTPUT: CorrelatedTopology                                                  │
│  {                                                                           │
│    routers: Router[],          // With discovered connections               │
│    connections: Connection[],   // Verified and inferred                    │
│    sites: Site[],              // Grouped routers                           │
│    unknownPeers: Peer[]        // Placeholder routers                       │
│  }                                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 React Flow Custom Nodes

### RouterNode Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTER NODE DESIGN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Handle (Top) - Tunnel connections                            │
│            ○   ○   ○   ○                                         │
│     ┌──────────────────────────────────────┐                    │
│     │  ┌────┐                              │                    │
│     │  │ 🔲 │  RTX1210                     │  ← Header          │
│     │  └────┘  S/N: S4H019271              │                    │
│     ├──────────────────────────────────────┤                    │
│     │  Status: ● Online                    │  ← Status          │
│     │  Firmware: Rev.14.01.05              │                    │
│     ├──────────────────────────────────────┤                    │
│     │  INTERFACES                          │  ← Interface List  │
│     │  ├─ lan1: 192.168.201.1/24    [LAN]  │                    │
│     │  ├─ lan2: 126.113.227.118/30  [WAN]  │                    │
│     │  └─ 4 tunnels configured             │                    │
│     ├──────────────────────────────────────┤                    │
│     │  TUNNELS                             │  ← Tunnel Summary  │
│     │  ├─ INFRA-RTX1200      ● Connected   │                    │
│     │  ├─ MONITORING         ● Connected   │                    │
│     │  ├─ FILESERVER         ● Connected   │                    │
│     │  └─ TWIN-INFRA         ● Connected   │                    │
│     └──────────────────────────────────────┘                    │
│            ○   ○   ○   ○                                         │
│     Handle (Bottom) - LAN connections                            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HANDLE POSITIONS:                                               │
│  - Top: Tunnel/VPN connections (orange)                          │
│  - Left: WAN/Internet (blue)                                     │
│  - Right: Additional WAN/PP (blue)                               │
│  - Bottom: LAN/Local network (green)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### RemoteRouterNode (Placeholder)

```
┌─────────────────────────────────────────────────────────────────┐
│                 REMOTE ROUTER NODE (Placeholder)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐                      │
│     │                                    │  ← Dashed border     │
│     │   🔲  Unknown Router               │    (not uploaded)    │
│     │                                    │                      │
│     │   Public IP: 126.113.220.91        │                      │
│     │                                    │                      │
│     │   Networks:                        │                      │
│     │   └─ 192.168.10.0/24               │                      │
│     │                                    │                      │
│     │   [ Upload Config ]                │  ← Action button     │
│     │                                    │                      │
│     └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘                      │
│                                                                  │
│  When config is uploaded, transitions to full RouterNode         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Layout Algorithms

### Hierarchical Layout (Default)

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIERARCHICAL LAYOUT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Level 0:              ☁️ Internet                               │
│                            │                                     │
│  Level 1:     ┌────────────┼────────────┐                        │
│               │            │            │                        │
│            [WAN Router] [WAN Router] [WAN Router]                │
│               │            │            │                        │
│  Level 2:     │     ╔══════╧══════╗     │                        │
│               │     ║  VPN Mesh   ║     │                        │
│               │     ╚══════╤══════╝     │                        │
│               │            │            │                        │
│  Level 3:  [LAN]        [LAN]        [LAN]                       │
│            Segment      Segment      Segment                     │
│                                                                  │
│  Algorithm:                                                      │
│  1. Place internet node at top                                   │
│  2. Place WAN-connected routers below                            │
│  3. Draw tunnel connections (horizontal)                         │
│  4. Place LAN segments below routers                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Site-Grouped Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    SITE-GROUPED LAYOUT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │  Site: Tokyo-HQ     │       │  Site: Osaka-DC     │          │
│  │  ┌───────────────┐  │       │  ┌───────────────┐  │          │
│  │  │   RTX1210     │  │═══════│  │  INFRA-RTX    │  │          │
│  │  └───────────────┘  │ VPN   │  └───────────────┘  │          │
│  │         │           │       │         │           │          │
│  │  ┌──────┴──────┐    │       │  ┌──────┴──────┐    │          │
│  │  │  192.168.   │    │       │  │  192.168.   │    │          │
│  │  │  201.0/24   │    │       │  │   10.0/24   │    │          │
│  │  └─────────────┘    │       │  └─────────────┘    │          │
│  └─────────────────────┘       └─────────────────────┘          │
│              ║                           ║                       │
│              ╚═══════════════════════════╝                       │
│                     VPN Tunnel Mesh                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Roadmap

### Week 1: Foundation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Project setup | Next.js + Tailwind + React Flow installed |
| 2 | Type definitions | All TypeScript interfaces |
| 3 | Zustand stores | configStore, topologyStore, uiStore |
| 4 | Basic UI layout | Header, sidebar, canvas area |
| 5 | File uploader | Drag & drop with preview |

### Week 2: Parsing Engine

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Parser architecture | Factory pattern, base types |
| 2 | Header parser | Model, serial, MAC extraction |
| 3 | Interface parser | LAN/WAN with IP addresses |
| 4 | Tunnel parser | IPSec VPN configuration |
| 5 | Route & NAT parser | Complete routing table |

### Week 3: Topology Generation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Node generator | Create React Flow nodes |
| 2 | Edge generator | Create connections |
| 3 | Custom RouterNode | Main router component |
| 4 | Custom edges | Tunnel, LAN, WAN styles |
| 5 | Correlation engine | Multi-router matching |

### Week 4: Visualization & Polish

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Layout algorithms | Hierarchical, site-grouped |
| 2 | Detail panels | Router, tunnel, network info |
| 3 | Site management | Create/assign sites |
| 4 | Export features | PNG, SVG, JSON |
| 5 | Persistence | LocalStorage save/load |

---

## 🚀 Tech Stack Summary

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14 | App Router, React 18 |
| Styling | Tailwind CSS | Utility-first CSS |
| Components | shadcn/ui | Accessible UI components |
| Visualization | React Flow | Network topology canvas |
| State | Zustand | Lightweight state management |
| Icons | Lucide React | Icon library |
| Types | TypeScript 5 | Type safety |
| Persistence | LocalStorage | Client-side storage |

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "zustand": "^4.4.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0"
  }
}
```

---

Ready to start building! 🎉
