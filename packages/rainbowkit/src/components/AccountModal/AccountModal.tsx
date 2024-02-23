import React, { ComponentProps } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useMainnetEnsAvatar } from '../../hooks/useMainnetEnsAvatar';
import { useMainnetEnsName } from '../../hooks/useMainnetEnsName';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { ProfileDetails } from '../ProfileDetails/ProfileDetails';
import { useAccountExtraInfo } from './context';

export type AccountModalProps = {
  open: boolean;
  onClose: () => void;
} & Pick<ComponentProps<typeof Dialog>, 'dialogRoot'>;

export function AccountModal({ onClose, open, dialogRoot }: AccountModalProps) {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const ensName = useMainnetEnsName(address);
  const ensAvatar = useMainnetEnsAvatar(ensName);
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
              balanceData={balanceData}
              ensAvatar={ensAvatar}
              ensName={ensName}
              onClose={onClose}
              onDisconnect={disconnect}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
