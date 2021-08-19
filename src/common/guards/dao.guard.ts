import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable
} from "@nestjs/common";
import { NEAR_SPUTNIK_PROVIDER } from "../constants";
import { DaoDto } from "src/daos/dto/dao.dto";
import { NearSputnikProvider } from "src/config/sputnik";

@Injectable()
export class DaoGuard implements CanActivate {
  constructor(
    @Inject(NEAR_SPUTNIK_PROVIDER)
    private nearSputnikProvider: NearSputnikProvider
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { id } = req.body as DaoDto;
    const { factoryContract } = this.nearSputnikProvider;

    const daos = await factoryContract.get_dao_list();

    const alreadyExists = daos.includes(id);
    if (alreadyExists) {
      throw new ForbiddenException(`DAO ${id} already exists`);
    }

    return true;
  }
}
