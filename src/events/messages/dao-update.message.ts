import { EVENT_DAO_UPDATE_MESSAGE_PATTERN } from "src/common/constants";
import { BaseMessage } from "./base.event";

export class DaoUpdateMessage extends BaseMessage {
  constructor(daoIds: string[]) {
    super(EVENT_DAO_UPDATE_MESSAGE_PATTERN, { daoIds });
  }
}
