import { TokenBalanceDto } from '@sputnik-v2/token/dto/token-balance.dto';
import { buildTokenBalanceId } from '@sputnik-v2/utils';

export function castTokenBalance(
  tokenId: string,
  accountId: string,
  balance: string,
): TokenBalanceDto {
  return {
    id: buildTokenBalanceId(tokenId, accountId),
    tokenId,
    accountId,
    balance,
  };
}
