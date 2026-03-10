Below is a **clean React Flow design specification** for your topology diagram.
This focuses **only on the UI/visual design structure** (not parsing configs, not backend logic).

The goal is to reproduce the **same visual hierarchy as your diagram**.

---

# 1. React Flow Layout Concept

Your diagram is **layer-based**.

Each row represents a **network tier**.

```
Tier 1  Cloud Services
Tier 2  Core Datacenter
Tier 3  HQ Core Network
Tier 4  Regional Sites
Tier 5  Branch Sites
```

React Flow canvas should be **vertical layered layout**.

Example coordinate grid:

```
y = 0      Cloud Layer
y = 200    Core DC
y = 400    HQ
y = 650    Regional
y = 900    Branch
```

---

# 2. Node Types

You only need **4 React Flow node types**.

## 1️⃣ Cloud Node

Used for:

* AWS
* Salesforce
* OBIC Datacenter
* ISP networks

Design:

```
+-------------------+
|       AWS         |
|   192.168.102.1   |
+-------------------+
```

React component structure:

```
CloudNode
 ├─ title
 └─ description
```

---

## 2️⃣ Router Node

Represents:

```
RTX1300
RTX830
FWX120
SRT100
```

Visual design:

```
+----------------------+
| telma                |
| RTX1300              |
| 192.168.11.2/24      |
+----------------------+
| 126.139.33.182/30    |
+----------------------+
```

Sections:

```
Header → network role
Body   → device model
Body   → LAN interface
Footer → WAN IP
```

---

## 3️⃣ Site Group Node (Container)

Each location is a **group container**.

Examples:

```
神戸
埼玉
横浜
京都
```

Design:

```
+---------------------------------+
| 神戸                            |
|                                 |
|  +-----------+   +-----------+  |
|  | telma     |   | public    |  |
|  | router    |   | router    |  |
|  +-----------+   +-----------+  |
+---------------------------------+
```

React Flow feature:

```
parentNode
extent="parent"
```

This keeps routers inside the site container.

---

## 4️⃣ Network Label Node (Optional)

Used for network segments.

Example:

```
192.168.10.0/24
```

Design:

```
[ 192.168.10.0/24 ]
```

Small floating label node.

---

# 3. Node Hierarchy

React Flow structure:

```
Site Container
    ├── telma router
    └── public router
```

Example:

```
site_kobe
   ├── router_kobe_telma
   └── router_kobe_public
```

React Flow node config:

```
router_kobe_telma
parentNode: site_kobe
extent: "parent"
```

---

# 4. Edge Design

Edges represent:

```
WAN connection
VPN tunnel
Internet link
Private backbone
```

Edge types:

### Primary backbone

```
HQ → Sites
```

Style:

```
thick yellow line
```

---

### Internet connection

```
router → cloud
```

Style:

```
thin yellow line
```

---

### VPN tunnel

```
site router → HQ router
```

Style:

```
dashed line
```

---

# 5. Color System

Use consistent colors like your diagram.

### Background

```
Canvas: dark blue
```

---

### Site containers

```
blue
```

---

### Core network

```
brown/orange
```

---

### Router nodes

```
yellow
```

---

### WAN IP label

```
red
```

---

Example palette:

```
Canvas        #0a3a5f
Site Group    #1e88c8
Core Group    #b0522c
Router        #f2c94c
IP Label      #ff6b6b
Edge          #ffd400
```

---

# 6. Node Size Standard

Keep sizes consistent.

### Router

```
width: 160px
height: 90px
```

---

### Site container

```
width: 300px
height: 160px
```

---

### Cloud node

```
width: 240px
height: 120px
```

---

# 7. Canvas Layout Strategy

Arrange horizontally per row.

Example:

### Regional Sites

```
神戸        埼玉        横浜        京都
 x100       x400        x700       x1000
 y650       y650        y650       y650
```

### Branch Sites

```
福岡 CC 高松 東北
北九州 広島 千葉 日町
名古屋 岡山 札幌
西東京 久留米 北陸
```

Grid layout works best.

---

# 8. React Flow Node Types Registration

Node types required:

```
routerNode
siteNode
cloudNode
networkLabelNode
```

Example structure:

```
nodeTypes = {
 router: RouterNode,
 site: SiteNode,
 cloud: CloudNode,
 network: NetworkLabelNode
}
```

---

# 9. Edge Types

Define custom edges.

```
edgeTypes = {
 backbone: BackboneEdge
 vpn: VpnEdge
 internet: InternetEdge
}
```

---

# 10. Example React Flow Graph Structure

Simplified example:

```
AWS
 │
HQ Router
 │
Site Container
   ├ telma router
   └ public router
```

Graph representation:

```
nodes
edges
```

Nodes include:

```
cloud
site group
router
```

Edges connect routers.

---

# 11. Interaction Design

Recommended features.

### Node hover

Show:

```
Router model
LAN network
WAN IP
```

---

### Node click

Open side panel.

```
interfaces
routes
tunnels
```

---

### Zoom levels

```
zoom out → show sites
zoom in  → show routers
```

---

# 12. Performance Consideration

Your diagram may reach:

```
40+ sites
80+ routers
200+ edges
```

So enable:

```
onlyRenderVisibleNodes
```

in React Flow.

---

# 13. Final UI Structure

```
+--------------------------------------------------+
| Upload Config Files                              |
+--------------------------------------------------+

+--------------------------------------------------+
| React Flow Canvas                                |
|                                                  |
|   Cloud Layer                                    |
|   Core Network                                   |
|   HQ                                             |
|   Regional Sites                                 |
|   Branch Sites                                   |
|                                                  |
+--------------------------------------------------+

+------------------------------+
| Router Detail Panel          |
+------------------------------+
```
