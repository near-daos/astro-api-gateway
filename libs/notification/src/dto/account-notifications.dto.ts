import { AccountNotification } from '../entities';

export class AccountNotificationsDto {
  accountId: string;
  data: AccountNotification[];
}
