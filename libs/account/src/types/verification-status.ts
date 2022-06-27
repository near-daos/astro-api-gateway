import { ApiProperty } from '@nestjs/swagger';

export class VerificationStatus {
  @ApiProperty()
  isVerified: boolean;

  @ApiProperty({ required: false })
  isSend?: boolean;

  @ApiProperty({ required: false })
  createdAt?: number;

  @ApiProperty({ required: false })
  ttl?: number;
}
