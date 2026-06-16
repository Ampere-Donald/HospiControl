import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Le frontend (Next.js) appelle l'API depuis un autre port -> CORS.
  // En dev on reflète l'origine ; à restreindre en production.
  app.enableCors({ origin: true });

  // Validation automatique des DTO : on retire les champs non déclarés.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API HospiControl démarrée sur http://localhost:${port}`);
}
void bootstrap();
