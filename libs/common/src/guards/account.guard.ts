import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PublicKey } from 'near-api-js/lib/utils';
import { Near } from 'near-api-js';

import { AccountBearer } from '../dto';
import { NEAR_PROVIDER } from '../constants';

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(
    @Inject(NEAR_PROVIDER)
    private near: Near,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { accountId, publicKey, signature } = req.body as AccountBearer;
    return this.verifyAccount(accountId, publicKey, signature);
  }

  async verifyAccount(
    accountId?: string,
    publicKey?: string,
    signature?: string,
  ): Promise<boolean> {
    const account = await this.near.account(accountId);

    let accessKeys;
    try {
      accessKeys = await account.getAccessKeys();
    } catch (err) {
      throw new ForbiddenException(`Authorization header is invalid`);
    }

    if (!accessKeys.find((key) => key.public_key === publicKey)) {
      throw new ForbiddenException(
        `Account ${accountId} identity is invalid - public key`,
      );
    }

    let isValid = true;
    try {
      isValid = PublicKey.fromString(publicKey).verify(
        Buffer.from(publicKey),
        Buffer.from(signature, 'base64'),
      );
    } catch (error) {
      throw new ForbiddenException('Invalid signature');
    }

    if (!isValid) {
      throw new ForbiddenException('Invalid signature');
    }

    return isValid;
  }
}
