import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class BaseEntityResponseDto {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isArchived: boolean;
}
