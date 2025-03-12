import React, {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useConfig } from 'wagmi';
import type { Chain } from 'wagmi/chains';
import { provideRainbowKitChains } from './provideRainbowKitChains';

export interface RainbowKitChain extends Chain {
  iconUrl?: string | (() => Promise<string>) | null;
  iconBackground?: string;
}

export type DisabledChain = RainbowKitChain & { info?: string };

interface RainbowKitChainContextValue {
  disabledChains: DisabledChain[];
  onDisabledChainClick?: (chain: DisabledChain) => void;
  chains: RainbowKitChain[];
  initialChainId?: number;
}

const RainbowKitChainContext = createContext<RainbowKitChainContextValue>({
  disabledChains: [],
  chains: [],
});

interface RainbowKitChainProviderProps {
  chainIdsToUse?: Set<number>;
  disabledChains?: DisabledChain[];
  onDisabledChainClick?: (chain: Chain) => void;
  initialChain?: Chain | number;
  children: ReactNode;
}

export function RainbowKitChainProvider({
  chainIdsToUse,
  disabledChains,
  onDisabledChainClick,
  children,
  initialChain,
}: RainbowKitChainProviderProps) {
  const { chains } = useConfig();

  const mappedChains = useMemo(
    () =>
      provideRainbowKitChains(
        chainIdsToUse
          ? (chains.filter((c) =>
              chainIdsToUse.has(c.id),
            ) as unknown as typeof chains)
          : chains,
      ),
    [chainIdsToUse, chains],
  );

  return (
    <RainbowKitChainContext.Provider
      value={useMemo(
        () => ({
          chains: mappedChains,
          disabledChains: provideRainbowKitChains(
            (disabledChains ?? []) as unknown as typeof chains,
          ),
          onDisabledChainClick,
          initialChainId:
            typeof initialChain === 'number' ? initialChain : initialChain?.id,
        }),
        [initialChain, disabledChains, onDisabledChainClick, mappedChains],
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

    for (const rkChain of rainbowkitChains) {
      rainbowkitChainsById[rkChain.id] = rkChain;
    }

    return rainbowkitChainsById;
  }, [rainbowkitChains]);
};
