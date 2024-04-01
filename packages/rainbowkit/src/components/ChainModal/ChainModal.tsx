import React, { ComponentProps, useContext, useMemo, useState } from 'react';
import { useAccount, useDisconnect, useSwitchChain, useConfig } from 'wagmi';
import { isMobile } from '../../utils/isMobile';
import { Box } from '../Box/Box';
import { CloseButton } from '../CloseButton/CloseButton';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { DisconnectSqIcon } from '../Icons/DisconnectSq';
import { MenuButton } from '../MenuButton/MenuButton';
import { I18nContext } from '../RainbowKitProvider/I18nContext';
import {
  DisabledChain,
  RainbowKitChain,
  useRainbowKitChains,
  useRainbowKitDisabledChains,
  useRainbowKitOnDisabledChainClick,
} from '../RainbowKitProvider/RainbowKitChainContext';
import { Text } from '../Text/Text';
import Chain from './Chain';
import {
  DesktopScrollClassName,
  MobileScrollClassName,
} from './ChainModal.css';

export type ChainModalProps = {
  open: boolean;
  onClose: () => void;
} & Pick<ComponentProps<typeof Dialog>, 'dialogRoot'>;

export function ChainModal({ onClose, open, dialogRoot }: ChainModalProps) {
  const { chainId: activeChainId } = useAccount();
  const { chains: connectorChains } = useConfig();
  const [pendingChainId, setPendingChainId] = useState<number | null>(null);
  const { switchChain, reset, isError } = useSwitchChain({
    mutation: {
      onMutate: ({ chainId: _chainId }) => {
        setPendingChainId(_chainId);
      },
      onSuccess: () => {
        if (pendingChainId) setPendingChainId(null);
        _onClose();
      },
      // onError: () => {
      //   if (pendingChainId) setPendingChainId(null);
      // },
      // onSettled: () => {
      //   _onClose();
      // },
    },
  });

  const _onClose = () => {
    reset();
    onClose();
  };

  const connectorChainsMap = useMemo(() => {
    return new Map(connectorChains.map((c) => [c.id, c]));
  }, [connectorChains]);

  const { i18n } = useContext(I18nContext);

  const { disconnect } = useDisconnect();
  const titleId = 'rk_chain_modal_title';
  const mobile = isMobile();
  const isCurrentChainSupported =
    activeChainId && connectorChainsMap.has(activeChainId);
  const chainIconSize = mobile ? '36' : '28';
  const rainbowkitChains = useRainbowKitChains();
  const rainbowkitDisabledChains = useRainbowKitDisabledChains();
  const rainbowKitOnDisabledChainClick = useRainbowKitOnDisabledChainClick();

  const rainbowkitDisabledChainsMap = useMemo(
    () => new Map(rainbowkitDisabledChains.map((c) => [c.id, c])),
    [rainbowkitDisabledChains],
  );

  const allRainbowkitChains = useMemo<
    (
      | (DisabledChain & { enabled: false })
      | (RainbowKitChain & { enabled: true })
    )[]
  >(
    () => [
      ...rainbowkitChains.reduce(
        (acc, rc) => {
          const chain = connectorChainsMap.get(rc.id);

          if (!chain || rainbowkitDisabledChainsMap.has(chain.id)) return acc;

          acc.push({ ...rc, ...chain, enabled: true });

          return acc;
        },
        [] as (RainbowKitChain & { enabled: boolean })[],
      ),

      ...rainbowkitDisabledChains.map((c) => ({
        ...c,
        enabled: false,
      })),
    ],
    [rainbowkitChains, rainbowkitDisabledChains, connectorChainsMap],
  );

  if (!activeChainId) {
    return null;
  }

  return (
    <Dialog
      onClose={onClose}
      open={open}
      titleId={titleId}
      dialogRoot={dialogRoot}
    >
      <DialogContent bottomSheetOnMobile paddingBottom="0">
        <Box display="flex" flexDirection="column" gap="14">
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            {mobile && <Box width="30" />}
            <Box paddingBottom="0" paddingLeft="8" paddingTop="4">
              <Text
                as="h1"
                color="modalText"
                id={titleId}
                size={mobile ? '20' : '18'}
                weight="heavy"
              >
                {i18n.t('chains.title')}
              </Text>
            </Box>
            <CloseButton onClose={onClose} />
          </Box>
          {!isCurrentChainSupported && (
            <Box marginX="8" textAlign={mobile ? 'center' : 'left'}>
              <Text color="modalTextSecondary" size="14" weight="medium">
                {i18n.t('chains.wrong_network')}
              </Text>
            </Box>
          )}
          <Box
            className={mobile ? MobileScrollClassName : DesktopScrollClassName}
            display="flex"
            flexDirection="column"
            gap="4"
            padding="2"
            paddingBottom="16"
          >
            {allRainbowkitChains.map((chain, idx) => {
              const { iconBackground, iconUrl, id, name, enabled } = chain;

              return (
                <Chain
                  key={id}
                  chainId={id}
                  currentChainId={activeChainId}
                  switchChain={switchChain}
                  chainIconSize={chainIconSize}
                  isLoading={pendingChainId === id}
                  src={iconUrl}
                  name={name}
                  iconBackground={iconBackground}
                  idx={idx}
                  enabled={enabled}
                  onDiabledChainClick={() =>
                    rainbowKitOnDisabledChainClick?.(chain)
                  }
                  switchError={isError}
                  chain={chain}
                />
              );
            })}
            {!isCurrentChainSupported && (
              <>
                <Box background="generalBorderDim" height="1" marginX="8" />
                <MenuButton
                  onClick={() => disconnect()}
                  testId="chain-option-disconnect"
                >
                  <Box
                    color="error"
                    fontFamily="body"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    <Box
                      alignItems="center"
                      display="flex"
                      flexDirection="row"
                      justifyContent="space-between"
                    >
                      <Box
                        alignItems="center"
                        display="flex"
                        flexDirection="row"
                        gap="4"
                        height={chainIconSize}
                      >
                        <Box
                          alignItems="center"
                          color="error"
                          height={chainIconSize}
                          justifyContent="center"
                          marginRight="8"
                        >
                          <DisconnectSqIcon size={Number(chainIconSize)} />
                        </Box>
                        <div>{i18n.t('chains.disconnect')}</div>
                      </Box>
                    </Box>
                  </Box>
                </MenuButton>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
