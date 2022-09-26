import { ApiProperty } from '@nestjs/swagger';
import { Token } from '../entities';

export class TokenResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  totalSupply: string;

  @ApiProperty()
  decimals: number;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  price: string;

  @ApiProperty({ required: false })
  balance?: string;

  @ApiProperty()
  tokenId?: string;
}

export function castTokenResponse({
  id,
  totalSupply,
  decimals,
  icon,
  symbol,
  price,
}: Token) {
  return {
    id,
    tokenId: id,
    totalSupply,
    decimals,
    icon,
    symbol,
    price,
  };
}
