import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { NearService } from "src/near/near.service";

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(private readonly nearService: NearService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { accountId, publicKey } = req.body;

    const accessKey = await this.nearService.findAccessKey(accountId, publicKey);

    if (!accessKey) {
      throw new ForbiddenException(`Account ${accountId} identity is invalid - public key`);
    }

    return true;
  }
}
