// Edge type registry
export { TunnelEdge } from './TunnelEdge';
export { WanEdge } from './WanEdge';
export { LanEdge } from './LanEdge';
export { BackboneEdge } from './BackboneEdge';
export { VpnEdge } from './VpnEdge';
export { InternetEdge } from './InternetEdge';

import { TunnelEdge } from './TunnelEdge';
import { WanEdge } from './WanEdge';
import { LanEdge } from './LanEdge';
import { BackboneEdge } from './BackboneEdge';
import { VpnEdge } from './VpnEdge';
import { InternetEdge } from './InternetEdge';

export const edgeTypes = {
  tunnel: TunnelEdge,
  wan: WanEdge,
  lan: LanEdge,
  backbone: BackboneEdge,
  vpn: VpnEdge,
  internet: InternetEdge,
};
