import { buildKYCTokenId } from '../../utils';
import { KYCToken } from '../entities/kyc-token.entity';

export class NTNFTTokenDto {
  token_id: string;
  owner_id: string;
  metadata: NTNFTTokenMetadataDto;
}

export class NTNFTTokenMetadataDto {
  title: string;
  description: string;
  media: string;
  media_hash: string;
  copies: number;
  issued_at: string | null;
  expires_at: string | null;
  starts_at: string | null;
  updated_at: string | null;
  extra: string | null;
  reference: string;
  reference_hash: string;
}

export function toKYCToken(
  kycContract: string,
  token: NTNFTTokenDto,
): KYCToken {
  const { token_id } = token;

  return {
    _id: buildKYCTokenId(kycContract, token_id),
    tokenId: token_id,
  };
}
