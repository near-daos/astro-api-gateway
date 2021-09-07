import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from './dao.controller';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';
import { CacheConfigService } from 'src/config';
import { NearModule } from 'src/near/near.module';
import { Policy } from './entities/policy.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Dao, Policy, Role]),
    NearModule,
  ],
  providers: [DaoService],
  controllers: [DaoController],
  exports: [DaoService],
})
export class DaoModule {}
