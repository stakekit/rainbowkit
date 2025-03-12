import type { Address } from 'viem';
import { useMainnetEnsAvatar } from './useMainnetEnsAvatar';
import { useMainnetEnsName } from './useMainnetEnsName';

interface UseProfileParameters {
  address?: Address;
}

export function useProfile({ address }: UseProfileParameters) {
  const ensName = useMainnetEnsName(address);
  const ensAvatar = useMainnetEnsAvatar(ensName);

  return { ensName, ensAvatar };
}
