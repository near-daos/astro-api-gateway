import { ID_DELIMITER } from '../common/constants';

export function getChunkCount(total: BigInt, chunkSize: number): number {
  return (Number(total) - (Number(total) % chunkSize)) / chunkSize + 1;
}

export function buildKYCTokenId(kycContract: string, tokenId: string): string {
  return [kycContract, tokenId].join(ID_DELIMITER);
}
