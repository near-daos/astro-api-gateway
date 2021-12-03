import { IsNotEmpty } from 'class-validator';

export class AccountTokenParams {
  @IsNotEmpty()
  accountId: string;

  @IsNotEmpty()
  tokenId: string;
}
