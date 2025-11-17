import { porto, type PortoParameters } from 'wagmi/connectors';
import type { Wallet, WalletDetailsParams } from '../../Wallet';
import { createConnector } from 'wagmi';
import { evmChainGroup } from '../../../utils/chain-groups';

export const portoWallet = (parameters: PortoParameters): Wallet => {
  return {
    id: 'porto',
    name: 'Porto',
    shortName: 'Porto',
    rdns: 'xyz.ithaca.porto',
    iconUrl: async () => (await import('./portoWallet.svg')).default,
    chainGroup: evmChainGroup,
    iconAccent: '#2E7CF6',
    iconBackground: '#2E7CF6',
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
      createConnector((config) => ({
        ...porto(parameters)(config),
        ...walletDetails,
      })),
  };
};
