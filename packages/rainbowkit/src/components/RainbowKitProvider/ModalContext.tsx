import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useAccount, useNetwork } from 'wagmi';
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
}

const ModalContext = createContext<ModalContextValue>({
  accountModalOpen: false,
  chainModalOpen: false,
  connectModalOpen: false,
  closeAccountModal: () => {},
  closeChainModal: () => {},
  closeConnectModal: () => {},
});

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
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

  const connectionStatus = useConnectionStatus();
  const { chain } = useNetwork();
  const chainSupported = !chain?.unsupported;

  interface CloseModalsOptions {
    keepConnectModalOpen?: boolean;
  }

  function closeModals({
    keepConnectModalOpen = false,
  }: CloseModalsOptions = {}) {
    if (!keepConnectModalOpen) {
      closeConnectModal();
    }
    closeAccountModal();
    closeChainModal();
  }

  const isUnauthenticated = useAuthenticationStatus() === 'unauthenticated';
  useAccount({
    onConnect: () => closeModals({ keepConnectModalOpen: isUnauthenticated }),
    onDisconnect: () => closeModals(),
  });

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
          openAccountModal:
            chainSupported && connectionStatus === 'connected'
              ? openAccountModal
              : undefined,
          openChainModal:
            connectionStatus === 'connected' ? openChainModal : undefined,
          openConnectModal:
            connectionStatus === 'disconnected' ||
            connectionStatus === 'unauthenticated'
              ? openConnectModal
              : undefined,
        }),
        [
          connectionStatus,
          chainSupported,
          accountModalOpen,
          chainModalOpen,
          connectModalOpen,
          openAccountModal,
          openChainModal,
          openConnectModal,
          closeConnectModal,
          closeAccountModal,
          closeChainModal,
        ],
      )}
    >
      {children}
      <ConnectModal onClose={closeConnectModal} open={connectModalOpen} />
      <AccountModal onClose={closeAccountModal} open={accountModalOpen} />
      <ChainModal onClose={closeChainModal} open={chainModalOpen} />
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

export function useConnectModal() {
  const { connectModalOpen, openConnectModal, closeConnectModal } =
    useContext(ModalContext);
  return { connectModalOpen, openConnectModal, closeConnectModal };
}
