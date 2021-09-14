import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AggregatorModule } from './aggregator/aggregator.module';
import { Transport } from '@nestjs/microservices';

export default class Aggregator  {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AggregatorModule, {
      transport: Transport.TCP,
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      console.log('Aggregator Microservice is listening...'),
    );
  }
}
