import { IsNotEmpty } from 'class-validator';

export class FindAccountParams {
  @IsNotEmpty()
  accountId: string;
}
