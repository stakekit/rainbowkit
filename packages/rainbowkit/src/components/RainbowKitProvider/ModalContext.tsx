import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAccount, useAccountEffect, useConfig } from 'wagmi';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { AccountModal } from '../AccountModal/AccountModal';
import { ChainModal } from '../ChainModal/ChainModal';
import { ConnectModal } from '../ConnectModal/ConnectModal';
import { useAuthenticationStatus } from './AuthenticationContext';

function useModalStateValue() {
  const [isModalOpen, setModalOpen] = useState(false);

  return {
    closeModal: useCallback(() => setModalOpen(false), []),
    isModalOpen,
    openModal: useCallback(() => setModalOpen(true), []),
  };
}

interface ModalContextValue {
  accountModalOpen: boolean;
  chainModalOpen: boolean;
  connectModalOpen: boolean;
  openAccountModal?: () => void;
  openChainModal?: () => void;
  openConnectModal?: () => void;
  closeAccountModal: () => void;
  closeChainModal: () => void;
  closeConnectModal: () => void;
  isWalletConnectModalOpen: boolean;
  setIsWalletConnectModalOpen: (isWalletConnectModalOpen: boolean) => void;
}

const ModalContext = createContext<ModalContextValue>({
  accountModalOpen: false,
  chainModalOpen: false,
  connectModalOpen: false,
  closeAccountModal: () => {},
  closeChainModal: () => {},
  closeConnectModal: () => {},
  isWalletConnectModalOpen: false,
  setIsWalletConnectModalOpen: () => {},
});

interface ModalProviderProps {
  children: ReactNode;
  dialogRoot?: Element;
  hideDisconnect?: boolean;
}

export function ModalProvider({
  children,
  dialogRoot,
  hideDisconnect,
}: ModalProviderProps) {
  const {
    closeModal: closeConnectModal,
    isModalOpen: connectModalOpen,
    openModal: openConnectModal,
  } = useModalStateValue();

  const {
    closeModal: closeAccountModal,
    isModalOpen: accountModalOpen,
    openModal: openAccountModal,
  } = useModalStateValue();

  const {
    closeModal: closeChainModal,
    isModalOpen: chainModalOpen,
    openModal: openChainModal,
  } = useModalStateValue();

  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] =
    useState(false);

  const connectionStatus = useConnectionStatus();

  const { chainId } = useAccount();
  const { chains } = useConfig();

  const isCurrentChainSupported = chains.some((chain) => chain.id === chainId);

  interface CloseModalsOptions {
    keepConnectModalOpen?: boolean;
  }

  const closeModals = useCallback(
    ({ keepConnectModalOpen = false }: CloseModalsOptions = {}) => {
      if (!keepConnectModalOpen) {
        closeConnectModal();
      }
      closeAccountModal();
      closeChainModal();
    },
    [closeConnectModal, closeAccountModal, closeChainModal],
  );

  const isUnauthenticated = useAuthenticationStatus() === 'unauthenticated';

  useAccountEffect({
    onConnect: () => closeModals({ keepConnectModalOpen: isUnauthenticated }),
    onDisconnect: () => closeModals(),
  });

  useEffect(() => {
    // Due to multiple connection feature in wagmi v2 we need to close
    // modals when user is unauthenticated. When connectors changes we log user out
    // This means we'll need to close the modals as well.
    if (isUnauthenticated) closeModals();
  }, [isUnauthenticated, closeModals]);

  return (
    <ModalContext.Provider
      value={useMemo(
        () => ({
          accountModalOpen,
          chainModalOpen,
          connectModalOpen,
          closeConnectModal,
          closeAccountModal,
          closeChainModal,
          isWalletConnectModalOpen,
          openAccountModal:
            isCurrentChainSupported && connectionStatus === 'connected'
              ? openAccountModal
              : undefined,
          openChainModal:
            connectionStatus === 'connected' ? openChainModal : undefined,
          openConnectModal:
            connectionStatus === 'disconnected' ||
            connectionStatus === 'unauthenticated'
              ? openConnectModal
              : undefined,
          setIsWalletConnectModalOpen,
        }),
        [
          connectionStatus,
          accountModalOpen,
          chainModalOpen,
          connectModalOpen,
          openAccountModal,
          openChainModal,
          openConnectModal,
          closeConnectModal,
          closeAccountModal,
          closeChainModal,
          isCurrentChainSupported,
          isWalletConnectModalOpen,
        ],
      )}
    >
      {children}
      <ConnectModal
        dialogRoot={dialogRoot}
        onClose={closeConnectModal}
        open={connectModalOpen}
      />
      <AccountModal
        dialogRoot={dialogRoot}
        onClose={closeAccountModal}
        open={accountModalOpen}
        hideDisconnect={hideDisconnect}
      />
      <ChainModal
        dialogRoot={dialogRoot}
        onClose={closeChainModal}
        open={chainModalOpen}
      />
    </ModalContext.Provider>
  );
}

export function useModalState() {
  const { accountModalOpen, chainModalOpen, connectModalOpen } =
    useContext(ModalContext);

  return {
    accountModalOpen,
    chainModalOpen,
    connectModalOpen,
  };
}

export function useAccountModal() {
  const { accountModalOpen, openAccountModal, closeAccountModal } =
    useContext(ModalContext);
  return { accountModalOpen, openAccountModal, closeAccountModal };
}

export function useChainModal() {
  const { chainModalOpen, openChainModal, closeChainModal } =
    useContext(ModalContext);
  return { chainModalOpen, openChainModal, closeChainModal };
}

export function useWalletConnectOpenState() {
  const { isWalletConnectModalOpen, setIsWalletConnectModalOpen } =
    useContext(ModalContext);

  return { isWalletConnectModalOpen, setIsWalletConnectModalOpen };
}

export function useConnectModal() {
  const { connectModalOpen, openConnectModal, closeConnectModal } =
    useContext(ModalContext);
  const { isWalletConnectModalOpen } = useWalletConnectOpenState();

  return {
    connectModalOpen: connectModalOpen || isWalletConnectModalOpen,
    openConnectModal,
    closeConnectModal,
  };
}
