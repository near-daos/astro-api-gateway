import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
