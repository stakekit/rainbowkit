import React, { useCallback, useContext, useEffect, useState } from 'react';
import type { GetEnsNameReturnType } from 'viem';
import type { GetEnsAvatarReturnType } from 'viem/actions';
import type { useAccount } from 'wagmi';
import { isMobile } from '../../utils/isMobile';
import type { AccountExtraInfo } from '../AccountModal/context';
import { Avatar } from '../Avatar/Avatar';
import { Box } from '../Box/Box';
import { CloseButton } from '../CloseButton/CloseButton';
import { formatAddress } from '../ConnectButton/formatAddress';
import { formatENS } from '../ConnectButton/formatENS';
import { CopiedIcon } from '../Icons/Copied';
import { CopyIcon } from '../Icons/Copy';
import { DisconnectIcon } from '../Icons/Disconnect';
import { MenuButton } from '../MenuButton/MenuButton';
import { I18nContext } from '../RainbowKitProvider/I18nContext';
import { ShowRecentTransactionsContext } from '../RainbowKitProvider/ShowRecentTransactionsContext';
import { Text } from '../Text/Text';
import { TxList } from '../Txs/TxList';
import { ProfileDetailsAction } from './ProfileDetailsAction';

interface ProfileDetailsProps {
  address: ReturnType<typeof useAccount>['address'];
  ensAvatar: GetEnsAvatarReturnType | undefined;
  ensName: GetEnsNameReturnType | undefined;
  onClose: () => void;
  onDisconnect: () => void;
  accountExtraInfo?: AccountExtraInfo;
  hideDisconnect?: boolean;
}

export function ProfileDetails({
  accountExtraInfo,
  address,
  ensAvatar,
  ensName,
  onClose,
  onDisconnect,
  hideDisconnect,
}: ProfileDetailsProps) {
  const showRecentTransactions = useContext(ShowRecentTransactionsContext);

  const [copiedAddress, setCopiedAddress] = useState(false);
  const copyAddressAction = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
    }
  }, [address]);

  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => {
        setCopiedAddress(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedAddress]);

  if (!address) {
    return null;
  }

  const accountName = ensName ? formatENS(ensName) : formatAddress(address);
  const titleId = 'rk_profile_title';
  const mobile = isMobile();

  const { i18n } = useContext(I18nContext);

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box background="profileForeground" padding="16">
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap={mobile ? '16' : '12'}
            justifyContent="center"
            margin="8"
            style={{ textAlign: 'center' }}
          >
            <Box
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
                willChange: 'transform',
              }}
            >
              <CloseButton onClose={onClose} />
            </Box>{' '}
            <Box marginTop={mobile ? '24' : '0'}>
              <Avatar
                address={address}
                imageUrl={ensAvatar}
                size={mobile ? 82 : 74}
              />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={mobile ? '4' : '0'}
              textAlign="center"
            >
              <Box textAlign="center">
                <Text
                  as="h1"
                  color="modalText"
                  id={titleId}
                  size={mobile ? '20' : '18'}
                  weight="heavy"
                >
                  {accountName}
                </Text>
              </Box>
            </Box>
            {accountExtraInfo?.otherAddresses.map((addr) => (
              <MenuButton
                currentlySelected={false}
                key={addr}
                onClick={() => {
                  accountExtraInfo.onOtherAddressClick(addr);
                  onClose();
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={mobile ? '4' : '0'}
                  textAlign="center"
                >
                  <Box textAlign="center">
                    <Text
                      as="h1"
                      color="modalText"
                      id={titleId}
                      size={mobile ? '20' : '18'}
                      weight="heavy"
                    >
                      {addr}
                    </Text>
                  </Box>
                </Box>
              </MenuButton>
            ))}
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            gap="8"
            margin="2"
            marginTop="16"
          >
            <ProfileDetailsAction
              action={copyAddressAction}
              icon={copiedAddress ? <CopiedIcon /> : <CopyIcon />}
              label={
                copiedAddress
                  ? i18n.t('profile.copy_address.copied')
                  : i18n.t('profile.copy_address.label')
              }
            />
            {!hideDisconnect && (
              <ProfileDetailsAction
                action={onDisconnect}
                icon={<DisconnectIcon />}
                label={i18n.t('profile.disconnect.label')}
                testId="disconnect-button"
              />
            )}
          </Box>
        </Box>
        {showRecentTransactions && (
          <>
            <Box background="generalBorder" height="1" marginTop="-1" />
            <Box>
              <TxList address={address} />
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
