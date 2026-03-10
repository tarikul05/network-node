// IP address utilities

/**
 * Parse IP address with CIDR notation
 */
export function parseIPWithCIDR(ip: string): { address: string; cidr: number } | null {
  const match = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!match) return null;
  
  return {
    address: match[1],
    cidr: parseInt(match[2], 10)
  };
}

/**
 * Calculate network address from IP and CIDR
 */
export function calculateNetworkAddress(ip: string, cidr: number): string {
  const octets = ip.split('.').map(Number);
  const mask = cidrToMask(cidr);
  const maskOctets = mask.split('.').map(Number);
  
  const networkOctets = octets.map((octet, i) => octet & maskOctets[i]);
  return networkOctets.join('.');
}

/**
 * Convert CIDR to subnet mask
 */
export function cidrToMask(cidr: number): string {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(8, Math.max(0, cidr - i * 8));
    mask.push(256 - Math.pow(2, 8 - bits));
  }
  return mask.join('.');
}

/**
 * Convert subnet mask to CIDR
 */
export function maskToCIDR(mask: string): number {
  return mask.split('.')
    .map(Number)
    .map(octet => octet.toString(2).split('1').length - 1)
    .reduce((a, b) => a + b, 0);
}

/**
 * Get network in CIDR notation
 */
export function getNetworkCIDR(ip: string, cidr: number): string {
  const network = calculateNetworkAddress(ip, cidr);
  return `${network}/${cidr}`;
}

/**
 * Check if two IPs are in the same network
 */
export function areInSameNetwork(ip1: string, cidr1: number, ip2: string, cidr2: number): boolean {
  // Use the smaller (more specific) CIDR
  const cidr = Math.max(cidr1, cidr2);
  const network1 = calculateNetworkAddress(ip1, cidr);
  const network2 = calculateNetworkAddress(ip2, cidr);
  return network1 === network2;
}

/**
 * Check if IP is private
 */
export function isPrivateIP(ip: string): boolean {
  const octets = ip.split('.').map(Number);
  
  // 10.0.0.0/8
  if (octets[0] === 10) return true;
  
  // 172.16.0.0/12
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  
  // 192.168.0.0/16
  if (octets[0] === 192 && octets[1] === 168) return true;
  
  return false;
}

/**
 * Determine interface type from IP and name
 */
export function inferInterfaceType(name: string, ip?: string): 'lan' | 'wan' | 'tunnel' | 'pp' | 'loopback' | 'bri' {
  const nameLower = name.toLowerCase();
  
  if (nameLower.startsWith('tunnel')) return 'tunnel';
  if (nameLower.startsWith('pp')) return 'pp';
  if (nameLower.startsWith('loopback') || nameLower === 'lo') return 'loopback';
  if (nameLower.startsWith('bri')) return 'bri';
  
  // If it has a public IP, likely WAN
  if (ip && !isPrivateIP(ip)) return 'wan';
  
  return 'lan';
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  
  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && octet === num.toString();
  });
}

/**
 * Generate unique ID for router based on serial or MAC
 */
export function generateRouterId(serial?: string, mac?: string, hostname?: string): string {
  if (serial) return `router-${serial}`;
  if (mac) return `router-${mac.replace(/:/g, '')}`;
  if (hostname) return `router-${hostname.toLowerCase().replace(/\s+/g, '-')}`;
  return `router-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique interface ID
 */
export function generateInterfaceId(routerId: string, interfaceName: string): string {
  return `${routerId}-${interfaceName}`;
}

/**
 * Format IP with optional CIDR
 */
export function formatIP(ip: string, cidr?: number): string {
  return cidr ? `${ip}/${cidr}` : ip;
}
