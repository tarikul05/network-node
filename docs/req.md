You want to build a **network topology viewer** (like the image) where:

* Each **site location** → contains **routers**
* Each **router** → contains **interfaces**
* Each **interface** → has **IP addresses**
* Users **upload router config files**
* The system **parses configs and renders topology**
* **Next.js only (no backend server)**

This is achievable using **client-side parsing + static storage**.

Below is a **practical development roadmap + architecture analysis**.

---

# 1. Project Goal

Create a **web tool** that:

1. Uploads router configuration files
2. Parses network information
3. Extracts:

   * hostname
   * interfaces
   * IP addresses
   * networks
4. Groups routers into **site locations**
5. Automatically **generates a topology diagram**

---

# 2. High Level Architecture

Since you want **Next.js without backend**, architecture will be:

```
User Browser
     │
     │ Upload Config File
     ▼
Next.js Frontend
     │
     ├── Config Parser (JS)
     ├── Network Analyzer
     ├── Topology Generator
     └── Visualization Engine
            │
            ▼
       Interactive Diagram
```

Everything runs **inside browser**.

---

# 3. Tech Stack Recommendation

### Core Framework

* **Next.js 14 (App Router)**

### Visualization

Choose one:

Best option:

* **React Flow**



### File Parsing

* FileReader API
* Custom config parser

---

### State Management

* Zustand (lightweight)

---

### Styling

* Tailwind CSS

---

# 4. Router Config Example Analysis

Example router config:

```
hostname RTX830

interface lan1
 ip address 192.168.1.1/24

interface pp1
 ip address 219.117.240.28

interface tunnel1
 ip address 10.0.0.1/30
```

Parser should extract:

```
{
  hostname: "RTX830",
  interfaces: [
    {
      name: "lan1",
      ip: "192.168.1.1/24",
      network: "192.168.1.0/24"
    },
    {
      name: "pp1",
      ip: "219.117.240.28"
    }
  ]
}
```

---

# 5. Data Model Design

Create a **structured JSON model**.

### Network Model

```
Site
 ├── Routers
 │     ├── Interfaces
 │     │       ├── IP
 │     │       └── Network
```

Example:

```js
{
  sites: [
    {
      name: "Tokyo",
      routers: [
        {
          name: "RTX830",
          interfaces: [
            {
              name: "lan1",
              ip: "192.168.1.1/24",
              network: "192.168.1.0/24"
            }
          ]
        }
      ]
    }
  ]
}
```

---



---



# 9. Visualization Layer

Use **React Flow** to render topology.

Each node = router

Each edge = network connection.

Example:

```
Router A ───── Router B
   |              |
192.168.1.0     192.168.1.0
```

---

# 10. UI Structure

Recommended UI:

```
+----------------------------------+
| Upload Router Config Files       |
+----------------------------------+

+----------------------------------+
| Topology Viewer                  |
|                                  |
|  [Site Group]                    |
|      Router                     |
|       |                         |
|      Router                     |
|                                  |
+----------------------------------+

+----------------------------------+
| Router Detail Panel              |
+----------------------------------+
```

---
