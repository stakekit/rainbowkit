import { isSafari } from '../../../utils/browsers';
import { ethereumChainGroup } from '../../../utils/chain-groups';
import type { Wallet } from '../../Wallet';
import {
  getInjectedConnector,
  hasInjectedProvider,
} from '../../getInjectedConnector';

export const tokenaryWallet = (): Wallet => ({
  id: 'tokenary',
  name: 'Tokenary',
  iconUrl: async () => (await import('./tokenaryWallet.svg')).default,
  iconBackground: '#ffffff',
  chainGroup: ethereumChainGroup,
  installed: hasInjectedProvider({ flag: 'isTokenary' }),
  hidden: () => !isSafari(),
  downloadUrls: {
    ios: 'https://tokenary.io/get',
    mobile: 'https://tokenary.io',
    qrCode: 'https://tokenary.io/get',
    safari: 'https://tokenary.io/get',
    browserExtension: 'https://tokenary.io/get',
  },
  createConnector: getInjectedConnector({ flag: 'isTokenary' }),
});
