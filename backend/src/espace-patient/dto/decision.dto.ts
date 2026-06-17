import { IsIn } from 'class-validator';

export class DecisionDto {
  @IsIn(['AUTORISE', 'REFUSE', 'REVOQUE'], {
    message: 'Décision invalide.',
  })
  decision: 'AUTORISE' | 'REFUSE' | 'REVOQUE';
}
