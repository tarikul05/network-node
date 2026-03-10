// Node type registry
export { RouterNode } from './RouterNode';
export { RemoteRouterNode } from './RemoteRouterNode';
export { InternetNode } from './InternetNode';
export { NetworkNode } from './NetworkNode';
export { CloudNode } from './CloudNode';
export { SiteNode } from './SiteNode';
export { NetworkLabelNode } from './NetworkLabelNode';

import { RouterNode } from './RouterNode';
import { RemoteRouterNode } from './RemoteRouterNode';
import { InternetNode } from './InternetNode';
import { NetworkNode } from './NetworkNode';
import { CloudNode } from './CloudNode';
import { SiteNode } from './SiteNode';
import { NetworkLabelNode } from './NetworkLabelNode';

export const nodeTypes = {
  router: RouterNode,
  remoteRouter: RemoteRouterNode,
  internet: InternetNode,
  network: NetworkNode,
  cloud: CloudNode,
  site: SiteNode,
  networkLabel: NetworkLabelNode,
};
