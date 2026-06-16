import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS : en dev (FRONTEND_URL absent) on reflète l'origine ; en production on
  // restreint à FRONTEND_URL (une ou plusieurs origines séparées par des virgules).
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
      : true,
  });

  // Validation automatique des DTO : on retire les champs non déclarés.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API HospiControl démarrée sur http://localhost:${port}`);
}
void bootstrap();
