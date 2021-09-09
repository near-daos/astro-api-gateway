import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearModule } from 'src/near/near.module';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), NearModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenSlimModule {}
