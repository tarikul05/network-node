// Edge type registry
export { TunnelEdge } from './TunnelEdge';
export { WanEdge } from './WanEdge';
export { LanEdge } from './LanEdge';

import { TunnelEdge } from './TunnelEdge';
import { WanEdge } from './WanEdge';
import { LanEdge } from './LanEdge';

export const edgeTypes = {
  tunnel: TunnelEdge,
  wan: WanEdge,
  lan: LanEdge,
};
