import { IsNotEmpty } from 'class-validator';

export class DeleteSubscriptionParams {
  @IsNotEmpty()
  daoId: string;
  @IsNotEmpty()
  accountId: string;
}
