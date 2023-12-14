import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { Chain as WagmiChain } from 'wagmi';
import { provideRainbowKitChains } from './provideRainbowKitChains';

export interface RainbowKitChain {
  id: number;
  name?: string;
  iconUrl?: string | (() => Promise<string>) | null;
  iconBackground?: string;
}

// This type is a combination of wagmi and RainbowKit chain types to make
// it easier for consumers to define their chain config in a single place.
export type Chain = WagmiChain & RainbowKitChain;

interface RainbowKitChainContextValue {
  chains: RainbowKitChain[];
  disabledChains: RainbowKitChain[];
  onDisabledChainClick?: (chain: RainbowKitChain) => void;
  initialChainId?: number;
}

const RainbowKitChainContext = createContext<RainbowKitChainContextValue>({
  chains: [],
  disabledChains: [],
});

interface RainbowKitChainProviderProps {
  chains: RainbowKitChain[];
  disabledChains?: RainbowKitChain[];
  onDisabledChainClick?: (chain: RainbowKitChain) => void;
  initialChain?: RainbowKitChain | number;
  children: ReactNode;
}

export function RainbowKitChainProvider({
  chains,
  disabledChains,
  onDisabledChainClick,
  children,
  initialChain,
}: RainbowKitChainProviderProps) {
  return (
    <RainbowKitChainContext.Provider
      value={useMemo(
        () => ({
          chains: provideRainbowKitChains(chains),
          disabledChains: provideRainbowKitChains(disabledChains ?? []),
          onDisabledChainClick,
          initialChainId:
            typeof initialChain === 'number' ? initialChain : initialChain?.id,
        }),
        [chains, initialChain, disabledChains, onDisabledChainClick],
      )}
    >
      {children}
    </RainbowKitChainContext.Provider>
  );
}

export const useRainbowKitChains = () =>
  useContext(RainbowKitChainContext).chains;

export const useRainbowKitDisabledChains = () =>
  useContext(RainbowKitChainContext).disabledChains;

export const useRainbowKitOnDisabledChainClick = () =>
  useContext(RainbowKitChainContext).onDisabledChainClick;

export const useInitialChainId = () =>
  useContext(RainbowKitChainContext).initialChainId;

export const useRainbowKitChainsById = () => {
  const rainbowkitChains = useRainbowKitChains();

  return useMemo(() => {
    const rainbowkitChainsById: Record<number, RainbowKitChain> = {};

    rainbowkitChains.forEach((rkChain) => {
      rainbowkitChainsById[rkChain.id] = rkChain;
    });

    return rainbowkitChainsById;
  }, [rainbowkitChains]);
};
