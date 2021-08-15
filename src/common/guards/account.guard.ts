import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable
} from "@nestjs/common";
import tweetnacl from "tweetnacl";
import { PublicKey } from "near-api-js/lib/utils";
import { SubscriptionDto } from "src/subscriptions/dto/subscription.dto";
import { Near } from "near-api-js";
import { NEAR_PROVIDER } from "../constants";

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(
    @Inject(NEAR_PROVIDER)
    private near: Near
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { accountId, publicKey, signature } = req.body as SubscriptionDto;

    const account = await this.near.account(accountId);
    const accessKeys = await account.getAccessKeys();

    if (!accessKeys.find(key => key.public_key === publicKey)) {
      throw new ForbiddenException(`Account ${accountId} identity is invalid - public key`);
    }

    try {
      const isValid = tweetnacl.sign.detached.verify(
        Buffer.from(publicKey),
        Buffer.from(signature, 'base64'),
        PublicKey.fromString(publicKey).data);

      if (!isValid) {
        throw new ForbiddenException('Invalid signature');
      }
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return false;
  }
}
