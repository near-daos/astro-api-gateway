import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class DeleteResponse {
  @ApiProperty()
  id: string | number;

  @ApiProperty()
  deleted: boolean;
}
