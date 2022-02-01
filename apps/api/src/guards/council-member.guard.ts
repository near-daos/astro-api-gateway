import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DaoService } from '@sputnik-v2/dao';

@Injectable()
export class CouncilMemberGuard implements CanActivate {
  constructor(private readonly daoService: DaoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { daoId } = req.params;

    const dao = await this.daoService.findById(daoId);

    if (!dao) {
      throw new NotFoundException(`DAO does not exist: ${daoId}`);
    }

    return req.isAuthenticated && dao.council.includes(req.accountId);
  }
}
