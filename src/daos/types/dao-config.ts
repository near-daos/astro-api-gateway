import { ApiProperty } from "@nestjs/swagger";

export class DaoConfig {
  /// Name of the DAO.
  @ApiProperty()
  name: string;
  /// Purpose of this DAO.
  @ApiProperty()
  purpose: string;
  /// Generic metadata. Can be used by specific UI to store additional data.
  /// This is not used by anything in the contract.
  @ApiProperty()
  metadata: string;
}
