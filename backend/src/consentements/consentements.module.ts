import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConsentementsController } from './consentements.controller';
import { ConsentementsService } from './consentements.service';

@Module({
  imports: [AuthModule], // pour JwtService (signature du lien magique patient)
  controllers: [ConsentementsController],
  providers: [ConsentementsService],
})
export class ConsentementsModule {}
