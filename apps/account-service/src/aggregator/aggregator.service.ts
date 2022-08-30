import { Injectable, Logger } from '@nestjs/common';
import { KYCNearService } from '../kyc';
import { KYCService } from '../kyc/kyc.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(
    private readonly kycService: KYCService,
    private readonly kycNearService: KYCNearService,
  ) {}

  public async aggregateKYCs() {
    const count = await this.kycService.getCount();

    let tokens = [];
    for await (const chunk of this.kycNearService.getAllTokens()) {
      tokens = tokens.concat(chunk);

      await this.kycService.createMultiple(tokens);
    }

    console.log(count);
  }
}
