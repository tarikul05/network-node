// Yamaha RTX configuration parser

import type { 
  Router, 
  RouterMetadata, 
  NetworkInterface, 
  Tunnel, 
  Route, 
  RouterServices,
  DHCPConfig,
  DNSConfig,
  NATConfig,
  IPSecConfig,
  ParseResult,
  ParseError,
  ParseWarning
} from '@/types';
import { YAMAHA_PATTERNS } from './patterns';
import { 
  parseIPWithCIDR, 
  getNetworkCIDR, 
  generateRouterId, 
  generateInterfaceId,
  isPrivateIP 
} from '@/lib/utils/ipUtils';
import { generateId } from '@/lib/utils';

interface TunnelParseContext {
  id: number;
  name?: string;
  description?: string;
  enabled: boolean;
  localAddress?: string;
  remoteAddress?: string;
  ipsec: Partial<IPSecConfig>;
}

export function parseYamahaConfig(content: string): ParseResult {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const lines = content.split('\n');
  
  // Initialize router structure
  const metadata = parseMetadata(lines, warnings);
  const interfaces = parseInterfaces(lines, metadata.serial);
  const routes = parseRoutes(lines);
  const tunnels = parseTunnels(lines, routes);
  const services = parseServices(lines);
  
  // Determine hostname from model or first line
  const hostname = metadata.model || 'Unknown Router';
  
  const router: Router = {
    id: generateRouterId(metadata.serial, metadata.macAddresses[0], hostname),
    hostname,
    model: metadata.model,
    serial: metadata.serial,
    firmware: metadata.firmware,
    interfaces,
    tunnels,
    routes,
    services,
    metadata: {
      macAddresses: metadata.macAddresses,
      memory: metadata.memory,
      hardware: metadata.hardware,
      reportingDate: metadata.reportingDate
    },
    configSource: content
  };
  
  return {
    success: errors.length === 0,
    router,
    errors,
    warnings,
    rawConfig: content
  };
}

interface ParsedMetadata {
  model?: string;
  firmware?: string;
  serial?: string;
  macAddresses: string[];
  memory?: string;
  hardware?: string;
  reportingDate?: string;
}

function parseMetadata(lines: string[], warnings: ParseWarning[]): ParsedMetadata {
  const result: ParsedMetadata = {
    macAddresses: []
  };
  
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    
    // Model and firmware
    const modelMatch = line.match(YAMAHA_PATTERNS.model);
    if (modelMatch) {
      result.model = modelMatch[1];
      result.firmware = modelMatch[2];
    }
    
    // MAC addresses
    const macMatch = line.match(YAMAHA_PATTERNS.macAddress);
    if (macMatch) {
      result.macAddresses = macMatch[1]
        .split(',')
        .map(m => m.trim())
        .filter(m => m);
    }
    
    // Hardware info
    const hwMatch = line.match(YAMAHA_PATTERNS.hardware);
    if (hwMatch) {
      result.memory = hwMatch[1];
      result.hardware = hwMatch[2];
    }
    
    // Serial number
    const serialMatch = line.match(YAMAHA_PATTERNS.serial);
    if (serialMatch) {
      result.serial = serialMatch[1];
    }
    
    // Reporting date
    const dateMatch = line.match(YAMAHA_PATTERNS.reportingDate);
    if (dateMatch) {
      result.reportingDate = dateMatch[1];
    }
  }
  
  if (!result.model) {
    warnings.push({
      message: 'Could not detect router model',
      code: 'NO_MODEL'
    });
  }
  
  return result;
}

function parseInterfaces(lines: string[], serial?: string): NetworkInterface[] {
  const interfaces: NetworkInterface[] = [];
  const natBindings = new Map<string, number>();
  const routerId = generateRouterId(serial);
  
  // First pass: collect NAT bindings
  for (const line of lines) {
    const natMatch = line.match(YAMAHA_PATTERNS.lanNat);
    if (natMatch) {
      natBindings.set(natMatch[1], parseInt(natMatch[2], 10));
    }
  }
  
  // Second pass: parse interface addresses
  for (const line of lines) {
    const lanMatch = line.match(YAMAHA_PATTERNS.lanAddress);
    if (lanMatch) {
      const name = lanMatch[1];
      const ip = lanMatch[2];
      const cidr = parseInt(lanMatch[3], 10);
      const network = getNetworkCIDR(ip, cidr);
      const hasNat = natBindings.has(name);
      const isWan = hasNat || !isPrivateIP(ip);
      
      interfaces.push({
        id: generateInterfaceId(routerId, name),
        name,
        type: isWan ? 'wan' : 'lan',
        ipAddress: ip,
        cidr,
        network,
        status: 'up',
        natDescriptor: natBindings.get(name)
      });
    }
  }
  
  return interfaces;
}

function parseRoutes(lines: string[]): Route[] {
  const routes: Route[] = [];
  
  for (const line of lines) {
    // Default route
    const defaultMatch = line.match(YAMAHA_PATTERNS.defaultRoute);
    if (defaultMatch) {
      routes.push({
        id: generateId(),
        network: '0.0.0.0/0',
        gateway: defaultMatch[1],
        gatewayType: 'ip',
        isDefault: true
      });
      continue;
    }
    
    // Static routes
    const staticMatch = line.match(YAMAHA_PATTERNS.staticRoute);
    if (staticMatch) {
      const gateway = staticMatch[2];
      const isTunnel = gateway.startsWith('tunnel');
      
      routes.push({
        id: generateId(),
        network: staticMatch[1],
        gateway,
        gatewayType: isTunnel ? 'tunnel' : 'ip',
        tunnelId: isTunnel ? parseInt(gateway.replace('tunnel ', ''), 10) : undefined
      });
    }
  }
  
  return routes;
}

function parseTunnels(lines: string[], routes: Route[]): Tunnel[] {
  const tunnels: Tunnel[] = [];
  let currentTunnel: TunnelParseContext | null = null;
  
  // Build route lookup by tunnel ID
  const tunnelRoutes = new Map<number, string[]>();
  for (const route of routes) {
    if (route.tunnelId) {
      const existing = tunnelRoutes.get(route.tunnelId) || [];
      existing.push(route.network);
      tunnelRoutes.set(route.tunnelId, existing);
    }
  }
  
  for (const line of lines) {
    // Start of tunnel block
    const selectMatch = line.match(YAMAHA_PATTERNS.tunnelSelect);
    if (selectMatch) {
      // Save previous tunnel if exists
      if (currentTunnel) {
        tunnels.push(finalizeTunnel(currentTunnel, tunnelRoutes));
      }
      
      currentTunnel = {
        id: parseInt(selectMatch[1], 10),
        enabled: false,
        ipsec: {
          pfs: false,
          keepalive: false,
          alwaysOn: false
        }
      };
      continue;
    }
    
    if (!currentTunnel) continue;
    
    // Tunnel name
    const nameMatch = line.match(YAMAHA_PATTERNS.tunnelName);
    if (nameMatch) {
      currentTunnel.name = nameMatch[1].trim();
      continue;
    }
    
    // Tunnel description
    const descMatch = line.match(YAMAHA_PATTERNS.tunnelDesc);
    if (descMatch) {
      currentTunnel.description = descMatch[1].trim();
      continue;
    }
    
    // Tunnel enable
    const enableMatch = line.match(YAMAHA_PATTERNS.tunnelEnable);
    if (enableMatch && parseInt(enableMatch[1], 10) === currentTunnel.id) {
      currentTunnel.enabled = true;
      continue;
    }
    
    // IPSec remote address
    const remoteMatch = line.match(YAMAHA_PATTERNS.ipsecRemote);
    if (remoteMatch) {
      currentTunnel.remoteAddress = remoteMatch[2];
      continue;
    }
    
    // IPSec local address
    const localMatch = line.match(YAMAHA_PATTERNS.ipsecLocal);
    if (localMatch) {
      currentTunnel.localAddress = localMatch[2];
      continue;
    }
    
    // IPSec encryption
    const encMatch = line.match(YAMAHA_PATTERNS.ipsecEncryption);
    if (encMatch) {
      currentTunnel.ipsec.encryption = encMatch[2];
      continue;
    }
    
    // IPSec hash
    const hashMatch = line.match(YAMAHA_PATTERNS.ipsecHash);
    if (hashMatch) {
      currentTunnel.ipsec.hash = hashMatch[2];
      continue;
    }
    
    // IPSec PFS
    const pfsMatch = line.match(YAMAHA_PATTERNS.ipsecPfs);
    if (pfsMatch) {
      currentTunnel.ipsec.pfs = pfsMatch[2] === 'on';
      continue;
    }
    
    // IPSec keepalive
    const keepaliveMatch = line.match(YAMAHA_PATTERNS.ipsecKeepalive);
    if (keepaliveMatch) {
      currentTunnel.ipsec.keepalive = keepaliveMatch[2] === 'on';
      continue;
    }
    
    // IPSec always-on
    const alwaysOnMatch = line.match(YAMAHA_PATTERNS.ipsecAlwaysOn);
    if (alwaysOnMatch) {
      currentTunnel.ipsec.alwaysOn = alwaysOnMatch[2] === 'on';
      continue;
    }
    
    // SA Policy
    const saMatch = line.match(YAMAHA_PATTERNS.ipsecSaPolicy);
    if (saMatch) {
      currentTunnel.ipsec.saPolicy = saMatch[3];
    }
  }
  
  // Don't forget the last tunnel
  if (currentTunnel) {
    tunnels.push(finalizeTunnel(currentTunnel, tunnelRoutes));
  }
  
  return tunnels;
}

function finalizeTunnel(ctx: TunnelParseContext, tunnelRoutes: Map<number, string[]>): Tunnel {
  return {
    id: ctx.id,
    name: ctx.name,
    description: ctx.description || ctx.name,
    localAddress: ctx.localAddress || '',
    remoteAddress: ctx.remoteAddress || '',
    enabled: ctx.enabled,
    targetNetworks: tunnelRoutes.get(ctx.id) || [],
    ipsec: {
      encryption: ctx.ipsec.encryption,
      hash: ctx.ipsec.hash,
      pfs: ctx.ipsec.pfs || false,
      keepalive: ctx.ipsec.keepalive || false,
      alwaysOn: ctx.ipsec.alwaysOn || false,
      saPolicy: ctx.ipsec.saPolicy
    }
  };
}

function parseServices(lines: string[]): RouterServices {
  const dhcp = parseDHCP(lines);
  const dns = parseDNS(lines);
  const nat = parseNAT(lines);
  
  return { dhcp, dns, nat };
}

function parseDHCP(lines: string[]): DHCPConfig | undefined {
  const scopes: DHCPConfig['scopes'] = [];
  let enabled = false;
  
  for (const line of lines) {
    if (line.includes('dhcp service server')) {
      enabled = true;
    }
    
    const scopeMatch = line.match(YAMAHA_PATTERNS.dhcpScope);
    if (scopeMatch) {
      const range = scopeMatch[2];
      const [rangeStart, rangeEnd] = range.includes('-') 
        ? range.split('-') 
        : [range, range];
        
      scopes.push({
        id: parseInt(scopeMatch[1], 10),
        rangeStart,
        rangeEnd,
        cidr: parseInt(scopeMatch[3], 10),
        gateway: scopeMatch[4] || ''
      });
    }
  }
  
  if (!enabled && scopes.length === 0) return undefined;
  
  return { enabled, scopes };
}

function parseDNS(lines: string[]): DNSConfig | undefined {
  let servers: string[] = [];
  let privateSpoof = false;
  
  for (const line of lines) {
    const serverMatch = line.match(YAMAHA_PATTERNS.dnsServer);
    if (serverMatch) {
      servers = serverMatch[1].trim().split(/\s+/);
    }
    
    const spoofMatch = line.match(YAMAHA_PATTERNS.dnsPrivateSpoof);
    if (spoofMatch) {
      privateSpoof = spoofMatch[1] === 'on';
    }
  }
  
  if (servers.length === 0) return undefined;
  
  return { servers, privateSpoof };
}

function parseNAT(lines: string[]): NATConfig[] {
  const natConfigs = new Map<number, NATConfig>();
  
  for (const line of lines) {
    // NAT type
    const typeMatch = line.match(YAMAHA_PATTERNS.natType);
    if (typeMatch) {
      const id = parseInt(typeMatch[1], 10);
      if (!natConfigs.has(id)) {
        natConfigs.set(id, {
          id,
          type: typeMatch[2] as 'masquerade' | 'static',
          outerAddress: '',
          staticMappings: []
        });
      } else {
        natConfigs.get(id)!.type = typeMatch[2] as 'masquerade' | 'static';
      }
      continue;
    }
    
    // NAT outer address
    const outerMatch = line.match(YAMAHA_PATTERNS.natOuter);
    if (outerMatch) {
      const id = parseInt(outerMatch[1], 10);
      if (!natConfigs.has(id)) {
        natConfigs.set(id, {
          id,
          type: 'masquerade',
          outerAddress: outerMatch[2],
          staticMappings: []
        });
      } else {
        natConfigs.get(id)!.outerAddress = outerMatch[2];
      }
      continue;
    }
    
    // NAT inner range
    const innerMatch = line.match(YAMAHA_PATTERNS.natInner);
    if (innerMatch) {
      const id = parseInt(innerMatch[1], 10);
      if (natConfigs.has(id)) {
        natConfigs.get(id)!.innerRange = innerMatch[2];
      }
      continue;
    }
    
    // NAT static mappings
    const staticMatch = line.match(YAMAHA_PATTERNS.natStatic);
    if (staticMatch) {
      const id = parseInt(staticMatch[1], 10);
      if (!natConfigs.has(id)) {
        natConfigs.set(id, {
          id,
          type: 'masquerade',
          outerAddress: '',
          staticMappings: []
        });
      }
      
      natConfigs.get(id)!.staticMappings.push({
        innerIp: staticMatch[3],
        protocol: staticMatch[4],
        port: staticMatch[5] || undefined
      });
    }
  }
  
  return Array.from(natConfigs.values());
}
