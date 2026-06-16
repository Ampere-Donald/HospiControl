import { Module } from '@nestjs/common';
import { HopitauxController } from './hopitaux.controller';
import { HopitauxService } from './hopitaux.service';

@Module({
  controllers: [HopitauxController],
  providers: [HopitauxService],
})
export class HopitauxModule {}
