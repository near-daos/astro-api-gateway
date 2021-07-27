import { IsNumber } from 'class-validator';

export class PagingQuery {
  @IsNumber()
  offset: number = 0;

  @IsNumber()
  limit: number = 50;
}
