import { Module } from '@nestjs/common';
import { ConsentementsController } from './consentements.controller';
import { ConsentementsService } from './consentements.service';

@Module({
  controllers: [ConsentementsController],
  providers: [ConsentementsService],
})
export class ConsentementsModule {}
