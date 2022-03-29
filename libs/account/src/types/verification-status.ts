import { ApiProperty } from '@nestjs/swagger';

export class VerificationStatus {
  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  isSend?: boolean;

  @ApiProperty()
  createdAt?: number;

  @ApiProperty()
  ttl?: number;
}
