import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class WalletCallbackParams {
  @ApiPropertyOptional({
    description: 'Transaction Hashes',
    default: ''
  })
  @IsOptional()
  @IsString()
  transactionHashes: string = '';

  @ApiPropertyOptional({
    description: 'Redirect URL'
  })
  @IsOptional()
  @IsUrl()
  redirectUrl: string;

  @ApiPropertyOptional({
    description: 'Callback Error Code'
  })
  @IsOptional()
  @IsString()
  errorCode: string;

  @ApiPropertyOptional({
    description: 'Callback Error Message'
  })
  @IsOptional()
  @IsString()
  errorMessage: string;
}
