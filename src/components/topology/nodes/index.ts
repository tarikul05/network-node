// Node type registry
export { RouterNode } from './RouterNode';
export { RemoteRouterNode } from './RemoteRouterNode';
export { InternetNode } from './InternetNode';
export { NetworkNode } from './NetworkNode';

import { RouterNode } from './RouterNode';
import { RemoteRouterNode } from './RemoteRouterNode';
import { InternetNode } from './InternetNode';
import { NetworkNode } from './NetworkNode';

export const nodeTypes = {
  router: RouterNode,
  remoteRouter: RemoteRouterNode,
  internet: InternetNode,
  network: NetworkNode,
};
