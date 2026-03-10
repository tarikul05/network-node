// Yamaha RTX router configuration parser patterns

export const YAMAHA_PATTERNS = {
  // Header patterns (comment lines starting with #)
  model: /^#\s*(\w+)\s+(Rev\.[\d.]+)/,
  macAddress: /^#\s*MAC Address\s*:\s*([\w:,\s]+)/i,
  hardware: /^#\s*Memory\s+(\d+\w+),\s*(.+)/i,
  serial: /serial=(\w+)/,
  reportingDate: /^#\s*Reporting Date:\s*(.+)/i,
  
  // Interface patterns
  lanAddress: /^ip\s+(lan\d+)\s+address\s+([\d.]+)\/(\d+)/,
  lanNat: /^ip\s+(lan\d+)\s+nat\s+descriptor\s+(\d+)/,
  
  // Routing patterns
  defaultRoute: /^ip\s+route\s+default\s+gateway\s+([\d.]+)/,
  staticRoute: /^ip\s+route\s+([\d.]+\/\d+)\s+gateway\s+(tunnel\s+\d+|[\d.]+)/,
  
  // Tunnel patterns
  tunnelSelect: /^tunnel\s+select\s+(\d+)/,
  tunnelName: /^\s*tunnel\s+name\s+(.+)/,
  tunnelDesc: /^\s*description\s+tunnel\s+(.+)/,
  tunnelEnable: /^\s*tunnel\s+enable\s+(\d+)/,
  
  // IPSec patterns
  ipsecTunnel: /^\s*ipsec\s+tunnel\s+(\d+)/,
  ipsecRemote: /^\s*ipsec\s+ike\s+remote\s+address\s+(\d+)\s+([\d.]+)/,
  ipsecLocal: /^\s*ipsec\s+ike\s+local\s+address\s+(\d+)\s+([\d.]+)/,
  ipsecEncryption: /^\s*ipsec\s+ike\s+encryption\s+(\d+)\s+(\S+)/,
  ipsecHash: /^\s*ipsec\s+ike\s+hash\s+(\d+)\s+(\S+)/,
  ipsecPfs: /^\s*ipsec\s+ike\s+pfs\s+(\d+)\s+(on|off)/,
  ipsecKeepalive: /^\s*ipsec\s+ike\s+keepalive\s+use\s+(\d+)\s+(on|off)/,
  ipsecAlwaysOn: /^\s*ipsec\s+ike\s+always-on\s+(\d+)\s+(on|off)/,
  ipsecSaPolicy: /^\s*ipsec\s+sa\s+policy\s+(\d+)\s+(\d+)\s+(.+)/,
  
  // NAT patterns
  natType: /^nat\s+descriptor\s+type\s+(\d+)\s+(\w+)/,
  natOuter: /^nat\s+descriptor\s+address\s+outer\s+(\d+)\s+(\S+)/,
  natInner: /^nat\s+descriptor\s+address\s+inner\s+(\d+)\s+([\d.-]+)/,
  natStatic: /^nat\s+descriptor\s+masquerade\s+static\s+(\d+)\s+(\d+)\s+([\d.]+)\s+(\w+)\s*(\S*)/,
  
  // Service patterns
  dhcpScope: /^dhcp\s+scope\s+(\d+)\s+([\d.-]+)\/(\d+)(?:\s+gateway\s+([\d.]+))?/,
  dnsServer: /^dns\s+server\s+([\d.\s]+)/,
  dnsPrivateSpoof: /^dns\s+private\s+address\s+spoof\s+(on|off)/,
};

/**
 * Check if content is likely a Yamaha config
 */
export function isYamahaConfig(content: string): boolean {
  const lines = content.split('\n').slice(0, 10);
  
  // Check for Yamaha-specific patterns
  const hasModelLine = lines.some(line => 
    /^#\s*(RTX|NVR|FWX)\d+/.test(line)
  );
  
  const hasYamahaCommands = content.includes('ip lan') || 
    content.includes('tunnel select') ||
    content.includes('ipsec ike');
    
  return hasModelLine || hasYamahaCommands;
}

/**
 * Detect Yamaha router model
 */
export function detectYamahaModel(content: string): string | null {
  const match = content.match(/^#\s*(RTX\d+|NVR\d+|FWX\d+)/m);
  return match ? match[1] : null;
}
