import React, { ComponentProps } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useProfile } from '../../hooks/useProfile';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { ProfileDetails } from '../ProfileDetails/ProfileDetails';
import { useAccountExtraInfo } from './context';

export type AccountModalProps = {
  open: boolean;
  onClose: () => void;
  hideDisconnect?: boolean;
} & Pick<ComponentProps<typeof Dialog>, 'dialogRoot'>;

export function AccountModal({
  onClose,
  open,
  dialogRoot,
  hideDisconnect,
}: AccountModalProps) {
  const { address } = useAccount();
  const { ensAvatar, ensName } = useProfile({
    address,
  });
  const { disconnect } = useDisconnect();

  const accountExtraInfo = useAccountExtraInfo();

  if (!address) {
    return null;
  }

  const titleId = 'rk_account_modal_title';

  return (
    <>
      {address && (
        <Dialog
          dialogRoot={dialogRoot}
          onClose={onClose}
          open={open}
          titleId={titleId}
        >
          <DialogContent bottomSheetOnMobile padding="0">
            <ProfileDetails
              accountExtraInfo={accountExtraInfo}
              address={address}
              ensAvatar={ensAvatar}
              ensName={ensName}
              balance={balance}
              onClose={onClose}
              onDisconnect={disconnect}
              hideDisconnect={hideDisconnect}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
