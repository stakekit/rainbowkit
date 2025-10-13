import { evmChainGroup } from '../../../utils/chain-groups';
import type { Wallet } from '../../Wallet';
import { getInjectedConnector } from '../../getInjectedConnector';

export const injectedWallet = (): Wallet => ({
  id: 'injected',
  name: 'Browser Wallet',
  iconUrl: async () => (await import('./injectedWallet.svg')).default,
  iconBackground: '#fff',
  chainGroup: evmChainGroup,
  createConnector: getInjectedConnector({}),
});
