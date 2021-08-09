import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { EVENT_SERVICE } from 'src/common/constants';
import { RabbitMQConfigService } from 'src/config/rabbitmq';
import configuration, { validationSchema } from '../config';
import { EventService } from './events.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    ClientsModule.registerAsync([{
      name: EVENT_SERVICE,
      useClass: RabbitMQConfigService
    }]),
  ],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule { }
